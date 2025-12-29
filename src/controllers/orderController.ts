import { Request, Response } from "express"
import { makeCheckoutUseCase } from "../infra/factories/checkoutFactory"
import { makeGetAllOrdersUseCase } from "../infra/factories/getAllOrdersFactory"
import { MongoOrderRepository } from "../infra/repositories/MongoOrderRepository"

const orderRepository = new MongoOrderRepository()

export async function checkout(req: Request, res: Response) {

    try {

        const user = req.user
        if (!user) return res.status(401).json({ message: "Unauthorized" })

        const checkoutUseCase = makeCheckoutUseCase()
        const result = await checkoutUseCase.execute({ userId: user.userId })

        return res.status(201).json({
            order: {
                _id: result.orderId,
                status: result.status,
                total: result.total,
            },
        })
    }

    catch (error: any) {
        const code = error?.code
        const known = ["CART_EMPTY", "PRODUCT_NOT_FOUND", "INSUFFICIENT_STOCK"]
        const status = known.includes(code) ? 400 : 500
        return res.status(status).json({ error: error.message })
    }
}

// Exportando createOrder para a rota POST /
export const createOrder = checkout

export async function updateOrderStatus(req: Request, res: Response) {

    try {

        const user = req.user
        if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

        const { id } = req.params
        if (!id) {

            return res.status(400).json({ message: "Product id is required" })
        }

        const { status } = req.body
        const updatedOrder = await orderRepository.updateStatus(id, status)

        if (!updatedOrder) {

            return res.status(404).json({ message: "Order not found" })
        }

        const newOrderStatus = {
            _id: updatedOrder.id,
            status: updatedOrder.status,
            total: updatedOrder.total,
        }

        return res.status(200).json(newOrderStatus)
    }

    catch {
        return res.status(500).json({ error: "Erro interno" })
    }
}

export async function getMyOrders(req: Request, res: Response) {
    try {
        const user = req.user
        if (!user) return res.status(401).json({ message: "Unauthorized" })

        const orders = await orderRepository.findByUserId(user.userId)
        return res.status(200).json(orders.map(o => ({ ...o, _id: o.id })))
    } catch {
        return res.status(500).json({ error: "Erro interno" })
    }
}

export async function getAllOrders(req: Request, res: Response) {
    try {
        const user = req.user
        if (!user || user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

        const useCase = makeGetAllOrdersUseCase()
        const orders = await useCase.execute({ actor: { id: user.userId, role: user.role } })
        return res.status(200).json(orders)
    } catch (error: any) {
        return res.status(403).json({ message: error.message })
    }
}