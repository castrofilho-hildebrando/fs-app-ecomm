import { Order } from "../../models/Order"
import { OrderRepository } from "../../application/ports/OrderRepository"

export class MongoOrderRepository implements OrderRepository {

    async create(data: {
        userId: string;
        items: { productId: string; quantity: number }[];
        total: number;
        status: string;
    }): Promise<{ id: string }> {

        const order = new Order({
            userId: data.userId,
            items: data.items,
            total: data.total,
            status: data.status,
        })

        await order.save()

        return { id: order._id.toString() }
    }

    async findById(id: string) {
        const order = await Order.findById(id)
        if (!order) return null

        return {
            id: order._id.toString(),
            status: order.status,
            userId: order.userId.toString()
        }
    }

    async findByUserId(userId: string) {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 })

        return orders.map(order => ({
            id: order._id.toString(),
            status: order.status,
            total: order.total,
            createdAt: order.createdAt
        }))
    }

    async findAll() {
        const orders = await Order.find().sort({ createdAt: -1 })

        return orders.map(order => ({
            id: order._id.toString(),
            userId: order.userId.toString(),
            status: order.status,
            total: order.total,
            createdAt: order.createdAt
        }))
    }

    async updateStatus(orderId: string, status: string) {
        await Order.updateOne(
            { _id: orderId },
            { $set: { status } }
        )
    }
}
