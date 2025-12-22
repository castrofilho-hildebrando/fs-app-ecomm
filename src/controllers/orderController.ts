import { Request, Response } from "express"
import { makeCheckoutUseCase } from "../infra/factories/checkoutFactory"
import { makeUpdateOrderStatusUseCase } from "../infra/factories/updateOrderStatusFactory"
import { makeListMyOrdersUseCase } from "../infra/factories/listMyOrdersFactory"
import { makeGetAllOrdersUseCase } from "../infra/factories/getAllOrdersFactory"

/**
 * POST /orders/checkout
 */
export async function checkout(req: Request, res: Response) {

    try {

        const user = req.user
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        const checkoutUseCase = makeCheckoutUseCase()
        const result = await checkoutUseCase.execute({

            userId: user.id,
        })

        return res.status(201).json(result)
    } catch (error) {

        return res.status(400).json({

            message: (error as Error).message,
        })
    }
}

/**
 * PATCH /orders/:id/status
 */
export async function updateOrderStatus(req: Request, res: Response) {

    try {

        const orderId = req.params.id
        if (!orderId) {

            return res.status(400).json({ message: "Order id is required" })
        }

        const user = req.user
        if (!user || !user.role) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        const { status } = req.body
        if (!status) {

            return res.status(400).json({ message: "New status is required" })
        }

        const useCase = makeUpdateOrderStatusUseCase()

        const result = await useCase.execute({

            orderId,
            newStatus: status,
            actor: {
                id: user.id,
                role: user.role,
            },
        })

        return res.status(200).json(result)
    } catch (error) {

        return res.status(400).json({

            message: (error as Error).message,
        })
    }
}

/* ===================================================== */
/* Abaixo: endpoints ainda NÃO migrados para Use Cases   */
/* (ficam como estão nesta fase)                         */
/* ===================================================== */

export async function createOrder(req: Request, res: Response) {

    // implementação existente (não alterada nesta fase)
}

export async function getMyOrders(req: Request, res: Response) {

    try {

        const user = req.user
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        const useCase = makeListMyOrdersUseCase()
        const orders = await useCase.execute({

            userId: user.id
        })

        return res.status(200).json(orders)
    } catch (error) {

        return res.status(500).json({

            message: (error as Error).message
        })
    }
}

export async function getAllOrders(req: Request, res: Response) {

    try {

        const user = req.user
        if (!user) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        const useCase = makeGetAllOrdersUseCase()
        const orders = await useCase.execute({

            actor: {
                id: user.id,
                role: user.role
            }
        })

        return res.status(200).json(orders)
    } catch (error) {

        return res.status(403).json({

            message: (error as Error).message
        })
    }
}
