import { CartRepository } from "../../application/ports/CartRepository"
import { Cart } from "../models/Cart"

export class MongoCartRepository implements CartRepository {

    async findByUserId(userId: string) {

        const cart = await Cart.findOne({ userId }).lean()

        if (!cart) {
            return null
        }

        return {
            userId: cart.userId.toString(),
            items: cart.items.map(item => ({
                productId: item.productId.toString(),
                quantity: item.quantity,
            })),
        }
    }

    async addItem(userId: string, productId: string, quantity: number) {

        await Cart.updateOne(
            { userId, "items.productId": productId },
            { $inc: { "items.$.quantity": quantity } }
        )

        await Cart.updateOne(
            { userId, "items.productId": { $ne: productId } },
            { $push: { items: { productId, quantity } } },
            { upsert: true }
        )
    }

    async removeItem(userId: string, productId: string) {
        await Cart.updateOne(
            { userId },
            { $pull: { items: { productId } } }
        )
    }

    async clear(userId: string) {
        await Cart.updateOne(
            { userId },
            { $set: { items: [] } }
        )
    }
}
