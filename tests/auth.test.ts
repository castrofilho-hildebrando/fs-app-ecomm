import request from "supertest"
import app from "../src/app"
import { createTestUser } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import "./setup"

clearDatabase()

describe("Auth Routes", () => {
    describe("POST /api/auth/register", () => {
        it("deve registrar um novo usuário", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Novo Usuário",
                    email: "novo@example.com",
                    password: "123456",
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty("token")
            expect(response.body.user).toHaveProperty(
                "email",
                "novo@example.com",
            )
        })

        it("não deve registrar usuário com email duplicado", async () => {
            const { user } = await createTestUser()

            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Hildebrando",
                    email: user.email,
                    password: "123456",
                })

            expect(response.status).toBe(409)
        })


        it("deve fazer login com credenciais válidas", async () => {
            const { user } = await createTestUser()

            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: user.email,
                    password: "123456",
                })

            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty("token")
        })

        it("não deve fazer login com senha incorreta", async () => {
            await createTestUser()

            const response = await request(app).post("/api/auth/login").send({
                email: "hildebrando@example.com",
                password: "senha_errada",
            })

            expect(response.status).toBe(401)
        })

        it("não deve fazer login com email inexistente", async () => {
            const response = await request(app).post("/api/auth/login").send({
                email: "naoexiste@example.com",
                password: "123456",
            })

            expect(response.status).toBe(401)
        })
    })
})
