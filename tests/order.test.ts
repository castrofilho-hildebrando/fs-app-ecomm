import request from "supertest";
import app from "../src/app";
import { createTestUser, createTestProduct } from "./helpers/testHelpers";
import { clearDatabase } from "./helpers/clearDatabase";
import mongoose from "mongoose";
import { Cart } from "../src/models/Cart";
import { Order } from "../src/models/Order";
import { Product } from "../src/models/Product"; 
import "./setup"; 

describe("Order Routes", () => {

    // Inicializar variáveis com strings vazias para evitar ReferenceError caso o beforeEach falhe
    let userToken: string = ''; 
    let adminToken: string = '';
    let userId: string = '';
    let adminId: string = '';
    let productId: string = '';
    const PRODUCT_PRICE = 10;
    const PRODUCT_STOCK = 5;
    
    // Configuração robusta e paralela
    beforeEach(async () => {

        clearDatabase();
        // Cria usuários e um produto base de forma eficiente
        const [user, admin, product] = await Promise.all([
            createTestUser("user"),
            createTestUser("admin"),
            createTestProduct({ price: PRODUCT_PRICE, stock: PRODUCT_STOCK })
        ]);

        userToken = user.token;
        userId = user.user._id.toString();
        adminToken = admin.token;
        adminId = admin.user._id.toString();

        productId = product._id.toString(); // ID do produto base preenchido aqui
    });

    // --- POST /api/orders/checkout ---
    describe("POST /api/orders/checkout", () => {
        it("deve criar um pedido e reduzir o estoque dos produtos", async () => {
            // Setup: Criar um carrinho com 3 unidades (reutiliza o produto do beforeEach)
            const quantity = 3;
            const initialProduct = await Product.findById(productId);
            const initialStock = initialProduct?.stock || 0; 

            const cart = new Cart({
                userId,
                items: [{ productId, quantity }],
            });
            await cart.save();

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${userToken}`)
                .send({}); 

            expect(response.status).toBe(201);
            // Verifica o total usando o preço do beforeEach (10) * quantidade (3)
            expect(response.body.order.total).toBe(PRODUCT_PRICE * quantity);

            // Verificação da Redução de Estoque
            const updatedProduct = await Product.findById(productId);
            expect(updatedProduct?.stock).toBe(initialStock - quantity); 

            // Verifica se o carrinho foi limpo
            const updatedCart = await Cart.findOne({ userId });
            expect(updatedCart?.items).toHaveLength(0);
        });

        it("deve falhar se o carrinho estiver vazio", async () => {
             // Garante que o carrinho está vazio (ou cria um vazio se não existir)
            const cart = new Cart({ userId, items: [] });
            await cart.save();

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("Carrinho vazio");
        });
        
        it("não deve criar pedido se o estoque for insuficiente", async () => {
            // Setup: Criar um carrinho com 6 unidades (Acima do estoque inicial de 5)
            const cart = new Cart({
                userId,
                items: [{ productId, quantity: 6 }],
            });
            await cart.save();

            const initialStock = (await Product.findById(productId))?.stock || 0; 

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${userToken}`)
                .send({}); 

            expect(response.status).toBe(400);
            expect(response.body.error).toContain("Estoque insuficiente");

            // Verifica se o estoque NÃO foi alterado
            const productAfterFailure = await Product.findById(productId);
            expect(productAfterFailure?.stock).toBe(initialStock); 

            // Verifica se o carrinho NÃO foi limpo
            const cartAfterFailure = await Cart.findOne({ userId });
            expect(cartAfterFailure?.items).toHaveLength(1);
        });
    });

    // --- GET /api/orders/my ---
    describe("GET /api/orders/my", () => {
        it("deve listar apenas os pedidos do usuário logado", async () => {
            // Cria um pedido para este usuário
            const myOrder = new Order({
                userId,
                items: [],
                total: 100,
                status: "pending",
            });
            await myOrder.save();

            // Cria um pedido para outro usuário
            await new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [],
                total: 50,
                status: "completed",
            }).save();

            const response = await request(app)
                .get("/api/orders/my")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]._id).toBe(myOrder._id.toString());
        });
    });

    // --- GET /api/orders (Admin) ---
    describe("GET /api/orders (Admin)", () => {
        it("deve listar todos os pedidos se for admin", async () => {
            await new Order({ userId, items: [], total: 100 }).save();
            await new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [],
                total: 200,
            }).save();

            const response = await request(app)
                .get("/api/orders")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
        });

        it("não deve permitir acesso a usuário comum", async () => {
            const response = await request(app)
                .get("/api/orders")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });
    });

    // --- PUT /api/orders/:id ---
    describe("PUT /api/orders/:id", () => {
        let orderToUpdate: Order;
        
        beforeEach(async () => {
            // Cria um pedido para ser atualizado (usa userId do describe principal)
            orderToUpdate = new Order({
                userId,
                items: [{ productId, quantity: 1 }],
                total: 100,
                status: "pending",
            });
            await orderToUpdate.save();
        });

        it("deve atualizar o status do pedido como admin", async () => {
            const response = await request(app)
                .put(`/api/orders/${orderToUpdate._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "shipped" });

            expect(response.status).toBe(200);
            expect(response.body.order.status).toBe("shipped");
        });

        it("não deve permitir que usuário comum atualize status", async () => {
            const response = await request(app)
                .put(`/api/orders/${orderToUpdate._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ status: "shipped" });

            expect(response.status).toBe(403);
        });
    });
});