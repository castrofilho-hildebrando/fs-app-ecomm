import {
    UpdateOrderStatusUseCase,
    UpdateOrderStatusInput,
    UpdateOrderStatusOutput
} from "./UpdateOrderStatusUseCase"

import { OrderRepository } from "../ports/OrderRepository"
import { OrderStatusDomainService } from "../../domain/services/OrderStatusDomainService"
import { OrderNotFoundError } from "../../domain/errors/OrderNotFoundError"

export class UpdateOrderStatusUseCaseImpl
implements UpdateOrderStatusUseCase {

    private readonly statusService = new OrderStatusDomainService()

    constructor(
        private readonly orderRepository: OrderRepository
    ) {}

    async execute(
        input: UpdateOrderStatusInput
    ): Promise<UpdateOrderStatusOutput> {

        const order = await this.orderRepository.findById(input.orderId)

        if (!order) {
            throw new OrderNotFoundError("Order not found")
        }

        this.statusService.validatePermission(
            input.actor.role,
            order.status,
            input.newStatus
        )

        this.statusService.validateTransition(
            order.status,
            input.newStatus
        )

        await this.orderRepository.updateStatus(
            order.id,
            input.newStatus
        )

        return {
            orderId: order.id,
            previousStatus: order.status,
            currentStatus: input.newStatus
        }
    }
}
