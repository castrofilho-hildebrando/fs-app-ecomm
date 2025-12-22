import request from "supertest"
import app from "../src/app"
import { Product } from "../src/models/Product"
import { createTestUser, createTestProduct } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import "./setup"

describe("Product Routes", () => {

    let adminToken: string
    let userToken: string
    let productId: string = ""

    // Dados para um novo produto de teste
    const newProductData = {
        name: "Laptop Gamer",
        description: "Máquina poderosa para jogos.",
        price: 5000.00,
        stock: 5,
    }

    beforeEach(async () => {

        clearDatabase()

        const [user, admin] = await Promise.all([
            createTestUser("user", "main"),
            createTestUser("admin", "main"),
        ])

        adminToken = admin.token
        userToken = user.token

        const product = await createTestProduct()
        productId = product._id.toString()
    })

    describe("GET /api/products", () => {

        it("deve listar todos os produtos (rota pública)", async () => {
            // Rota pública, não requer token
            const response = await request(app).get("/api/products") 

            expect(response.status).toBe(200)
            expect(response.body).toBeInstanceOf(Array)
            // Deve encontrar o produto criado no beforeEach
            expect(response.body.length).toBeGreaterThanOrEqual(1)
        })
    })

    describe("POST /api/products (Admin)", () => {

        it("deve permitir que o ADMIN crie um novo produto (201)", async () => {
            const response = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send(newProductData)

            expect(response.status).toBe(201)
            expect(response.body.product.name).toBe(newProductData.name)
            expect(response.body.product.price).toBe(newProductData.price)

            // Verifica se foi salvo no DB
            const dbProduct = await Product.findById(response.body.product._id)
            expect(dbProduct).not.toBeNull()
        })

        it("não deve permitir que o USUÁRIO COMUM crie um produto (403)", async () => {

            const response = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${userToken}`)
                .send(newProductData)

            expect(response.status).toBe(403)
            expect(response.body.error).toContain("Requer permissão de Administrador")
        })

        it("deve retornar 401 se não houver token", async () => {

            const response = await request(app)
                .post("/api/products")
                .send(newProductData)

            expect(response.status).toBe(401)
        })

        it("deve falhar se dados obrigatórios (name/price) estiverem faltando (400)", async () => {
            const response = await request(app)
                .post("/api/products")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ description: "só descrição" }) // Faltando name e price

            expect(response.status).toBe(400)
            expect(response.body.error).toContain("obrigatórios") // Mensagem do productController
        })
    })

    describe("PUT /api/products/:id", () => {
        it("deve atualizar produto como admin", async () => {
            const product = await createTestProduct()

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    price: 299.99,
                })

            expect(response.status).toBe(200)
            expect(response.body.product.price).toBe(299.99)
        })
    })

    describe("DELETE /api/products/:id", () => {
        it("deve deletar produto como admin", async () => {
            const product = await createTestProduct()

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
        })
    })
})
