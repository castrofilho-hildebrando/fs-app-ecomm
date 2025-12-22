import request from "supertest"
import app from "../src/app"
import { createTestUser } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import "./setup"

describe("User Routes", () => {
    let adminToken: string
    let userToken: string
    let userId: string

    beforeEach(async () => {

        clearDatabase()
        const admin = await createTestUser("admin")
        const user = await createTestUser("user")
        adminToken = admin.token
        userToken = user.token
        userId = user.user._id.toString()
    })

    describe("GET /api/users", () => {
        it("deve listar usuários como admin", async () => {
            const response = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
            expect(response.body.length).toBeGreaterThanOrEqual(2) // admin + user
        })

        it("não deve retornar hash de senha", async () => {
            const response = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body[0]).not.toHaveProperty("passwordHash")
        })

        it("não deve listar usuários sem ser admin", async () => {
            const response = await request(app)
                .get("/api/users")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(403)
        })

        it("não deve listar usuários sem autenticação", async () => {
            const response = await request(app).get("/api/users")

            expect(response.status).toBe(401)
        })
    })

    describe("GET /api/users/:id", () => {
        it("deve buscar usuário por ID como admin", async () => {
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("email")
            expect(response.body).toHaveProperty("name")
            expect(response.body).not.toHaveProperty("passwordHash")
        })

        it("deve retornar 404 para usuário inexistente", async () => {
            const fakeId = "507f1f77bcf86cd799439011"

            const response = await request(app)
                .get(`/api/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })

        it("não deve buscar usuário sem ser admin", async () => {
            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(403)
        })

        it("não deve buscar usuário sem autenticação", async () => {
            const response = await request(app).get(`/api/users/${userId}`)

            expect(response.status).toBe(401)
        })
    })

    describe("PUT /api/users/:id", () => {
        it("deve atualizar usuário como admin", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Nome Atualizado" })

            expect(response.status).toBe(200)
            expect(response.body.user.name).toBe("Nome Atualizado")
            expect(response.body.message).toBe("Usuário atualizado com sucesso!")
        })

        it("não deve retornar hash de senha ao atualizar", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Nome Atualizado" })

            expect(response.status).toBe(200)
            expect(response.body.user).not.toHaveProperty("passwordHash")
        })

        it("deve atualizar múltiplos campos", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Novo Nome",
                    email: "novoemail@example.com",
                })

            expect(response.status).toBe(200)
            expect(response.body.user.name).toBe("Novo Nome")
            expect(response.body.user.email).toBe("novoemail@example.com")
        })

        it("deve retornar 404 para usuário inexistente", async () => {
            const fakeId = "507f1f77bcf86cd799439011"

            const response = await request(app)
                .put(`/api/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ name: "Nome" })

            expect(response.status).toBe(404)
        })

        it("não deve atualizar usuário sem ser admin", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Nome Atualizado" })

            expect(response.status).toBe(403)
        })

        it("não deve atualizar usuário sem autenticação", async () => {
            const response = await request(app)
                .put(`/api/users/${userId}`)
                .send({ name: "Nome Atualizado" })

            expect(response.status).toBe(401)
        })
    })

    describe("DELETE /api/users/:id", () => {
        it("deve deletar usuário como admin", async () => {
            const response = await request(app)
                .delete(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(200)
            expect(response.body.message).toBe("Usuário removido com sucesso!")
        })

        it("usuário deletado não deve mais existir", async () => {
            await request(app)
                .delete(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            const response = await request(app)
                .get(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })

        it("deve retornar 404 para usuário inexistente", async () => {
            const fakeId = "507f1f77bcf86cd799439011"

            const response = await request(app)
                .delete(`/api/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)

            expect(response.status).toBe(404)
        })

        it("não deve deletar usuário sem ser admin", async () => {
            const response = await request(app)
                .delete(`/api/users/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(403)
        })

        it("não deve deletar usuário sem autenticação", async () => {
            const response = await request(app).delete(`/api/users/${userId}`)

            expect(response.status).toBe(401)
        })
    })
})