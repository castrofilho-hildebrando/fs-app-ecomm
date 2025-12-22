import request from "supertest"
import mongoose from "mongoose"
import app from "../src/app"
import { createTestUser } from "./helpers/testHelpers"
import { clearDatabase } from "./helpers/clearDatabase"
import { Address, IAddress } from "../src/models/Address" // Certifique-se de importar IAddress se estiver usando TypeScript
import "./setup" 

describe("Address Routes", () => {
    let userToken: string = ""
    let userId: string = ""
    let anotherUserToken: string = ""
    let anotherUserId: string = ""

    // Data padrão para um endereço
    const addressData = {
        street: "Rua Teste, 123",
        city: "Cidade Teste",
        state: "SP",
        zipCode: "12345-678",
        country: "Brasil",
    }

    beforeEach(async () => {

        clearDatabase()
        
        // Criar dois usuários para testar isolamento de dados
        const [user, anotherUser] = await Promise.all([
            createTestUser("user", "main"), 
            createTestUser("user", "other"),
        ])

        userToken = user.token
        userId = user.user._id.toString()
        anotherUserToken = anotherUser.token
        anotherUserId = anotherUser.user._id.toString()
    })

    // Helper para criar um endereço no DB diretamente
    const createAddressInDB = async (id: string, data: any): Promise<IAddress> => {
        const address = new Address({
            userId: id,
            ...data,
        })
        await address.save()
        return address as IAddress
    }

    // =================================================================
    // POST /api/addresses
    // =================================================================
    describe("POST /api/addresses", () => {
        it("deve criar um novo endereço para o usuário (201)", async () => {
            const response = await request(app)
                .post("/api/addresses")
                .set("Authorization", `Bearer ${userToken}`)
                .send(addressData)

            expect(response.status).toBe(201)
            expect(response.body.address.street).toBe(addressData.street)
            expect(response.body.address.userId.toString()).toBe(userId)

            const dbAddress = await Address.findById(response.body.address._id)
            expect(dbAddress).not.toBeNull()
        })

        it("deve falhar se dados obrigatórios estiverem faltando (400)", async () => {
            const response = await request(app)
                .post("/api/addresses")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ street: addressData.street }) // Faltando city, state, zipCode

            expect(response.status).toBe(400)
            expect(response.body.error).toContain("obrigatórios")
        })

        it("deve falhar se não houver token (401)", async () => {
            const response = await request(app)
                .post("/api/addresses")
                .send(addressData)

            expect(response.status).toBe(401)
        })
        
        it("deve definir como default e desativar o default anterior", async () => {
            // 1. Cria um endereço padrão que deve ser desativado
            const initialDefault = await createAddressInDB(userId, { ...addressData, isDefault: true, street: "Default Antigo" })

            // 2. Cria um novo endereço padrão (novo default)
            const response = await request(app)
                .post("/api/addresses")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ ...addressData, isDefault: true, street: "Novo Default" })

            expect(response.status).toBe(201)
            expect(response.body.address.isDefault).toBe(true)

            // 3. Verifica no DB se o default antigo foi desativado
            const oldDefault = await Address.findById(initialDefault._id)
            expect(oldDefault?.isDefault).toBe(false)
        })
    })

    // =================================================================
    // GET /api/addresses
    // =================================================================
    describe("GET /api/addresses", () => {
        it("deve listar apenas endereços do usuário logado (200)", async () => {
            // Endereço do usuário logado
            const userAddress = await createAddressInDB(userId, addressData)
            // Endereço de outro usuário
            await createAddressInDB(anotherUserId, { ...addressData, street: "Rua Estranha" })

            const response = await request(app)
                .get("/api/addresses")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(1)
            expect(response.body[0].street).toBe(userAddress.street)
        })

        it("deve retornar array vazio se não houver endereços (200)", async () => {
            // Nenhuma criação de endereço
            const response = await request(app)
                .get("/api/addresses")
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(200)
            expect(response.body).toHaveLength(0)
        })

        it("deve falhar se não houver token (401)", async () => {
            const response = await request(app)
                .get("/api/addresses")

            expect(response.status).toBe(401)
        })
    })
    
    // =================================================================
    // PUT /api/addresses/:id
    // =================================================================
    describe("PUT /api/addresses/:id", () => {
        let address: IAddress

        beforeEach(async () => {
            address = await createAddressInDB(userId, addressData)
        })

        it("deve atualizar um endereço existente (200)", async () => {
            const update = { street: "Nova Rua, 999", zipCode: "87654-321" }
            
            const response = await request(app)
                .put(`/api/addresses/${address._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send(update)

            expect(response.status).toBe(200)
            expect(response.body.address.street).toBe(update.street)
            expect(response.body.address.zipCode).toBe(update.zipCode)
            expect(response.body.address.city).toBe(address.city) // Não deve mudar
        })

        it("deve falhar ao atualizar endereço de outro usuário (404)", async () => {
            // Tenta atualizar o endereço do user pelo anotherUser
            const response = await request(app)
                .put(`/api/addresses/${address._id}`)
                .set("Authorization", `Bearer ${anotherUserToken}`)
                .send({ street: "Tentativa de Fraude" })

            expect(response.status).toBe(404)
            expect(response.body.error).toContain("não pertence ao usuário")
        })

        it("deve falhar se não houver token (401)", async () => {
            const update = { street: "Nova Rua" }
            const response = await request(app)
                .put(`/api/addresses/${address._id}`)
                .send(update)

            expect(response.status).toBe(401)
        })
        
        it("deve tornar o endereço padrão e desativar o anterior", async () => {
            // 1. Cria um segundo endereço, define o primeiro como default
            await Address.findByIdAndUpdate(address._id, { isDefault: true })
            const secondAddress = await createAddressInDB(userId, { ...addressData, street: "Segundo Endereço", isDefault: false })
            
            // 2. Atualiza o segundo endereço para ser o default
            const response = await request(app)
                .put(`/api/addresses/${secondAddress._id}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ isDefault: true })

            expect(response.status).toBe(200)
            expect(response.body.address.isDefault).toBe(true)

            // 3. Verifica no DB se o default original foi desativado
            const oldDefault = await Address.findById(address._id)
            expect(oldDefault?.isDefault).toBe(false)
        })
    })

    // =================================================================
    // DELETE /api/addresses/:id
    // =================================================================
    describe("DELETE /api/addresses/:id", () => {
        let addressToDelete: IAddress

        beforeEach(async () => {
            addressToDelete = await createAddressInDB(userId, addressData)
        })

        it("deve deletar um endereço existente (200)", async () => {
            const response = await request(app)
                .delete(`/api/addresses/${addressToDelete._id}`)
                .set("Authorization", `Bearer ${userToken}`)

            expect(response.status).toBe(200)
            expect(response.body.message).toContain("removido com sucesso")

            const dbAddress = await Address.findById(addressToDelete._id)
            expect(dbAddress).toBeNull()
        })

        it("deve falhar ao deletar endereço de outro usuário (404)", async () => {
            const response = await request(app)
                .delete(`/api/addresses/${addressToDelete._id}`)
                .set("Authorization", `Bearer ${anotherUserToken}`)

            expect(response.status).toBe(404)
            expect(response.body.error).toContain("não pertence ao usuário")

            // Verifica se o endereço ainda está no DB
            const dbAddress = await Address.findById(addressToDelete._id)
            expect(dbAddress).not.toBeNull()
        })

        it("deve falhar se não houver token (401)", async () => {
            const response = await request(app)
                .delete(`/api/addresses/${addressToDelete._id}`)

            expect(response.status).toBe(401)
        })
    })
})