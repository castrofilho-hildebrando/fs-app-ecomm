import request from "supertest";
import app from "../src/app";
import { clearDatabase } from "./helpers/clearDatabase";
import { createTestUser, createTestProduct } from "./helpers/testHelpers";
import "./setup";

clearDatabase();

describe("Cart Routes", () => {
    let userToken: string;
    let userId: string;
    let productId: string;

    beforeEach(async () => {
        const user = await createTestUser("user");
        userToken = user.token;
        userId = user.user._id.toString();

        const product = await createTestProduct();
        productId = product._id.toString();
    });

    describe("GET /api/cart", () => {
        it("deve retornar carrinho vazio para novo usuário", async () => {
            const response = await request(app)
                .get("/api/cart")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.items || []).toHaveLength(0);
        });

        it("não deve acessar carrinho sem autenticação", async () => {
            const response = await request(app).get("/api/cart");

            expect(response.status).toBe(401);
        });
    });

    describe("POST /api/cart/add", () => {
        it("deve adicionar item ao carrinho", async () => {
            const response = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    productId,
                    quantity: 2,
                });

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(1);
            expect(response.body.cart.items[0].quantity).toBe(2);
        });

        it("deve incrementar quantidade se produto já existe", async () => {
            // Adiciona pela primeira vez
            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId, quantity: 2 });

            // Adiciona novamente
            const response = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId, quantity: 3 });

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(1);
            expect(response.body.cart.items[0].quantity).toBe(5);
        });

        it("não deve adicionar sem autenticação", async () => {
            const response = await request(app)
                .post("/api/cart/add")
                .send({ productId, quantity: 2 });

            expect(response.status).toBe(401);
        });

        it("não deve adicionar item sem productId ou quantity", async () => {
            const response = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId, quantity: undefined }); // Falta quantity (ou productId)

            // Esperar 400 se o controlador for implementado para validar o payload
            // Atualmente o controller falharia com 500 ou erro de Mongoose, mas 400 é o correto.
            expect(response.status).toBe(400);
        });

        it("não deve adicionar produto que não existe", async () => {
            // ID inexistente (válido no formato Mongoose, mas não no DB)
            const fakeProductId = "507f1f77bcf86cd799439011";

            const response = await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId: fakeProductId, quantity: 1 });

            // Se o controlador for corrigido para validar o Product ID no DB antes de adicionar.
            expect(response.status).toBe(404);
        });
    });

    describe("POST /api/cart/remove", () => {
        it("deve remover item do carrinho", async () => {
            // Adiciona item
            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId, quantity: 2 });

            // Remove item
            const response = await request(app)
                .post("/api/cart/remove")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId });

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(0);
        });

        it("deve retornar 404 se carrinho não existe", async () => {
            const response = await request(app)
                .post("/api/cart/remove")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId });

            expect(response.status).toBe(404);
        });
    });

    describe("POST /api/cart/clear", () => {
        it("deve limpar carrinho", async () => {
            // Adiciona itens
            await request(app)
                .post("/api/cart/add")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ productId, quantity: 2 });

            // Limpa carrinho
            const response = await request(app)
                .post("/api/cart/clear")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.cart.items).toHaveLength(0);
        });

        it("deve retornar 404 se carrinho não existe", async () => {
            const response = await request(app)
                .post("/api/cart/clear")
                .set("Authorization", `Bearer ${userToken}`);

            expect(response.status).toBe(404);
        });
    });
});
