import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app"
import { createTestUser, createTestProduct } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import { Order } from "../src/infra/models/Order"
import { Cart } from "../src/infra/models/Cart"
import "./setup"

describe("Admin Routes", () => {
    let adminToken: string
    let userToken: string
    let product1: any

    beforeEach(async () => {

        clearDatabase()
        const admin = await createTestUser("admin")
        const user = await createTestUser("user")
        adminToken = admin.token
        userToken = user.token
        product1 = await createTestProduct({ price: 100 }) // Produto base para pedidos
    })

    describe("GET /api/admin/stats", () => {
        it("deve retornar estatísticas completas para o admin", async () => {
            // Setup: Criar dados para popular as estatísticas

            // 1. Produtos (product1 já existe do beforeEach)
            await createTestProduct({ price: 50 })

            // 2. Pedido
            const order = new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [{ productId: product1._id, quantity: 2 }],
                total: 200,
                status: "completed",
            })
            await order.save()

            // 3. Carrinho
            const cart = new Cart({
                userId: new mongoose.Types.ObjectId(),
                items: [{ productId: product1._id, quantity: 1 }],
            })
            await cart.save()

            const response = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)

            // Verificações de estrutura e valores
            expect(response.body).toHaveProperty("users")
            // Admin (1) + User (1) no beforeEach = 2
            expect(response.body.users.total).toBeGreaterThanOrEqual(2)

            expect(response.body).toHaveProperty("products")
            // product1 + product2 no setup = 2
            expect(response.body.products.total).toBe(2)

            expect(response.body).toHaveProperty("orders")
            expect(response.body.orders.total).toBe(1)
            expect(response.body.orders.revenueTotal).toBe(200)

            expect(response.body).toHaveProperty("carts")
            expect(response.body.carts.avgItems).toBe(1)
        })

        it("deve filtrar estatísticas por intervalo de datas", async () => {
            // Setup: Data de Hoje (usaremos 2025-12-15 como base)
            const TODAY = new Date("2025-12-15T12:00:00.000Z")

            // Pedido A: DENTRO do período de filtro (Total 100, Status: paid)
            const orderA = new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [{ productId: product1._id, quantity: 1 }],
                total: 100,
                status: "paid",
                createdAt: TODAY, // Hoje
            })
            await orderA.save()

            // Pedido B: FORA do período de filtro (Total 500, Status: completed)
            const YESTERDAY = new Date("2025-12-14T12:00:00.000Z") // Ontem
            const orderB = new Order({
                userId: new mongoose.Types.ObjectId(),
                items: [{ productId: product1._id, quantity: 5 }],
                total: 500,
                status: "completed",
                createdAt: YESTERDAY,
            })
            await orderB.save()

            // DEFINIR O FILTRO: Apenas para "Hoje"
            const filterStart = "2025-12-15T00:00:00.000Z"
            const filterEnd = "2025-12-15T23:59:59.999Z"

            const response = await request(app)
                .get(
                    `/api/admin/stats?startDate=${filterStart}&endDate=${filterEnd}`,
                )
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)

            // Deve contar APENAS o Pedido A
            expect(response.body.orders.total).toBe(1)
            expect(response.body.orders.revenueTotal).toBe(100)

            // O status 'completed' do Pedido B não deve aparecer
            const paidStatus = response.body.orders.byStatus.find(
                (s: any) => s._id === "paid",
            )
            const completedStatus = response.body.orders.byStatus.find(
                (s: any) => s._id === "completed",
            )

            expect(paidStatus?.count).toBe(1)
            expect(completedStatus).toBeUndefined() // Verifica se o pedido de ontem foi excluído
        })

        it("não deve permitir acesso a usuário comum", async () => {
            const response = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(403)
        })

        it("não deve permitir acesso sem autenticação", async () => {
            const response = await request(app).get("/api/admin/stats")

            expect(response.status).toBe(401)
        })
    })
})
