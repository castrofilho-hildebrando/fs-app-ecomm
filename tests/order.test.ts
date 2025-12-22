import request from "supertest"
import app from "../src/app"
import { createTestUser, createTestProduct } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import mongoose from "mongoose"
import { Cart } from "../src/models/Cart"
import { Order } from "../src/models/Order"
import { Product } from "../src/models/Product" 
import "./setup" 

describe("Order Routes", () => {

    // Inicializar variáveis com strings vazias para evitar ReferenceError caso o beforeEach falhe
    let userToken: string = "" 
    let adminToken: string = ""
    let userId: string = ""
    let adminId: string = ""
    let productId: string = ""
    const PRODUCT_PRICE = 10
    const PRODUCT_STOCK = 5
    
    // Configuração robusta e paralela
    beforeEach(async () => {

        clearDatabase()
        // Cria usuários e um produto base de forma eficiente
        const [user, admin, product] = await Promise.all([
            createTestUser("user"),
            createTestUser("admin"),
            createTestProduct({ price: PRODUCT_PRICE, stock: PRODUCT_STOCK })
        ])

        userToken = user.token
        userId = user.user._id.toString()
        adminToken = admin.token
        adminId = admin.user._id.toString()

        productId = product._id.toString() // ID do produto base preenchido aqui
    })

    // --- POST /api/orders/checkout ---
    describe("POST /api/orders/checkout", () => {

        it("deve criar um pedido com sucesso quando o estoque for suficiente", async () => {
            const { user, token } = await createTestUser()

            const product = await Product.create({
                name: "Produto Teste",
                price: 100,
                stock: 10,
            })

            await Cart.create({
                userId: user._id,
                items: [
                    {
                        productId: product._id,
                        quantity: 2,
                    },
                ],
            })

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("order")
            expect(response.body.order.total).toBe(200)

            const productAfter = await Product.findById(product._id)
            expect(productAfter!.stock).toBe(8)

            const cartAfter = await Cart.findOne({ userId: user._id })
            expect(cartAfter!.items.length).toBe(0)
        })

        it("não deve criar pedido se o carrinho estiver vazio", async () => {
            const { user, token } = await createTestUser()

            await Cart.create({
                userId: user._id,
                items: [],
            })

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(400)
            expect(response.body.error).toContain("Carrinho vazio")
        })

        it("não deve criar pedido se algum produto não existir", async () => {
            const { user, token } = await createTestUser()

            const fakeProductId = new mongoose.Types.ObjectId()

            await Cart.create({
                userId: user._id,
                items: [
                    {
                        productId: fakeProductId,
                        quantity: 1,
                    },
                ],
            })

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(400)
            expect(response.body.error).toContain("Produto")
            expect(response.body.error).toContain("não encontrado")
        })

        it("não deve criar pedido se o estoque for insuficiente", async () => {
            const { user, token } = await createTestUser()

            const product = await Product.create({
                name: "Produto com Estoque Baixo",
                price: 50,
                stock: 1,
            })

            await Cart.create({
                userId: user._id,
                items: [
                    {
                        productId: product._id,
                        quantity: 5, // maior que o estoque
                    },
                ],
            })

            const response = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${token}`)

            expect(response.status).toBe(400)
            expect(response.body.error).toContain("Estoque insuficiente")

            // garante que o estoque NÃO foi alterado
            const productAfterFailure = await Product.findById(product._id)
            expect(productAfterFailure!.stock).toBe(1)

            // garante que o pedido NÃO foi criado
            const orders = await Order.find({ userId: user._id })
            expect(orders.length).toBe(0)
        })

    })


    // --- GET /api/orders/my ---
    describe("GET /api/orders/my", () => {
        it("deve listar apenas os pedidos do usuário logado", async () => {
            // Cria um pedido para este usuário
            const myOrder = new Order({
                userId,
                items: [],
                total: 100,
                status: "pending",
            })
            await myOrder.save()

            // Cria um pedido para outro usuário
            await new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [],
                total: 50,
                status: "completed",
            }).save()

            const response = await request(app)
                .get("/api/orders/my")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(1)
            expect(response.body[0]._id).toBe(myOrder._id.toString())
        })
    })

    // --- GET /api/orders (Admin) ---
    describe("GET /api/orders (Admin)", () => {
        it("deve listar todos os pedidos se for admin", async () => {
            await new Order({ userId, items: [], total: 100 }).save()
            await new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [],
                total: 200,
            }).save()

            const response = await request(app)
                .get("/api/orders")
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(2)
        })

        it("não deve permitir acesso a usuário comum", async () => {
            const response = await request(app)
                .get("/api/orders")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(403)
        })

        // --- PUT /api/orders/:id ---
        it("deve atualizar o status do pedido como admin", async () => {
            const { user, token: userToken } = await createTestUser()
            const { token: adminToken } = await createTestUser("admin")

            const product = await Product.create({
                name: "Produto Teste",
                price: 100,
                stock: 10,
            })

            await Cart.create({
                userId: user._id,
                items: [
                    {
                        productId: product._id,
                        quantity: 1,
                    },
                ],
            })

            // checkout como user
            const checkoutResponse = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${userToken}`)

            expect(checkoutResponse.status).toBe(201)

            const orderId = checkoutResponse.body.order._id

            // 🔹 admin marca como pago
            const paidResponse = await request(app)
                .put(`/api/orders/${orderId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "paid" })

            expect(paidResponse.status).toBe(200)
            expect(paidResponse.body.status).toBe("paid")

            // 🔹 admin envia
            const shippedResponse = await request(app)
                .put(`/api/orders/${orderId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ status: "shipped" })

            expect(shippedResponse.status).toBe(200)
            expect(shippedResponse.body.status).toBe("shipped")
        })

        it("não deve permitir que usuário comum atualize status", async () => {
            const { user, token: userToken } = await createTestUser()
            const { token: adminToken } = await createTestUser("admin")

            const product = await Product.create({
                name: "Produto Teste",
                price: 100,
                stock: 10,
            })

            await Cart.create({
                userId: user._id,
                items: [
                    {
                        productId: product._id,
                        quantity: 1,
                    },
                ],
            })

            // pedido nasce via checkout (como user)
            const checkoutResponse = await request(app)
                .post("/api/orders/checkout")
                .set("Authorization", `Bearer ${userToken}`)

            expect(checkoutResponse.status).toBe(201)

            const orderId = checkoutResponse.body.order._id

            // tentativa de update como usuário comum
            const response = await request(app)
                .put(`/api/orders/${orderId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ status: "shipped" })

            expect(response.status).toBe(403)
        })

    })
})