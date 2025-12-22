import { Cart } from "../../models/Cart"
import { CartRepository } from "../../application/ports/CartRepository"

export class MongoCartRepository implements CartRepository {

    async findByUserId(userId: string) {
        const cart = await Cart.findOne({ userId })

        if (!cart) return null

        return {

            items: cart.items.map(i => ({
                productId: i.productId.toString(),
                quantity: i.quantity
            }))
        }
    }

    async clearByUserId(userId: string): Promise<void> {

        await Cart.updateOne(
            { userId },
            { $set: { items: [] } }
        );
    }

    async save(userId: string, items: { productId: string; quantity: number }[]) {
        await Cart.updateOne(
            { userId },
            { $set: { items } },
            { upsert: true }
        )
    }
}
