import { Order } from "../models/Order"
import { OrderRepository } from "../../application/ports/OrderRepository"

export class MongoOrderRepository implements OrderRepository {

    async save(order: any): Promise<void> {
        await Order.create(order)
    }

    async create(order: any): Promise<any> {
        const newOrder = new Order(order)
        await newOrder.save()

        return {
            id: newOrder._id.toString(),
            userId: newOrder.userId.toString(),
            items: newOrder.items,
            total: newOrder.total,
            status: newOrder.status,
            createdAt: newOrder.createdAt,
        }
    }

    async findByUserId(userId: string) {
        const orders = await Order.find({ userId })
        return orders.map(order => ({
            id: order._id.toString(),
            userId: order.userId.toString(),
            items: order.items,
            total: order.total,
            status: order.status,
        }))
    }

    async findById(id: string) {
        const order = await Order.findById(id)
        if (!order) return null
        return {
            id: order._id.toString(),
            userId: order.userId.toString(),
            items: order.items,
            total: order.total,
            status: order.status,
        }
    }

    async updateStatus(id: string, status: string) {
        const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
        if (!order) return null
        return {
            id: order._id.toString(),
            userId: order.userId.toString(),
            items: order.items,
            total: order.total,
            status: order.status,
        }
    }

    async findAll() {
        const orders = await Order.find()
        return orders.map(o => ({
            id: o._id.toString(),
            userId: o.userId.toString(),
            items: o.items,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt,
        }))
    }
}