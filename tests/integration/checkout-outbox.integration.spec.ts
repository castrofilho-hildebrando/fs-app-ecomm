import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"

import { makeCheckoutUseCase } from "../../src/infra/factories/checkoutFactory"
import { MongoOutboxDispatcher } from "../../src/infra/outbox/MongoOutboxDispatcher"

import { Cart } from "../../src/infra/models/Cart"
import { Product } from "../../src/infra/models/Product"
import { Outbox } from "../../src/infra/models/Outbox"

let mongo: MongoMemoryServer

beforeAll(async () => {
    mongo = await MongoMemoryServer.create()

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongo.getUri())
    }
})

afterAll(async () => {
    await mongoose.disconnect()
    await mongo.stop()
})

afterEach(async () => {
    await mongoose.connection.db.dropDatabase()
})

describe("Checkout + Outbox integration", () => {

    it("should persist outbox event and dispatch it correctly", async () => {

        // Arrange
        const userId = new mongoose.Types.ObjectId()
        const productId = new mongoose.Types.ObjectId()

        await Product.create({
            _id: productId,
            name: "Notebook",
            price: 3000,
            stock: 10,
        })

        await Cart.create({
            userId,
            items: [
                {
                    productId,
                    quantity: 1,
                },
            ],
        })

        const checkoutUseCase = makeCheckoutUseCase()

        // Act — executar checkout
        const result = await checkoutUseCase.execute({ userId })

        // Assert — pedido criado
        expect(result.orderId).toBeDefined()
        expect(result.total).toBe(3000)
        expect(result.status).toBe("pending")

        // Assert — evento salvo no Outbox
        const eventsBefore = await Outbox.find()

        expect(eventsBefore).toHaveLength(1)
        expect(eventsBefore[0].name).toBe("order.placed")
        expect(eventsBefore[0].processed).toBe(false)

        // Act — dispatcher
        const dispatcher = new MongoOutboxDispatcher()
        await dispatcher.dispatch()

        // Assert — evento processado
        const eventAfter = await Outbox.findById(eventsBefore[0]._id)

        expect(eventAfter?.processed).toBe(true)
        expect(eventAfter?.processedAt).toBeDefined()
    })

})
