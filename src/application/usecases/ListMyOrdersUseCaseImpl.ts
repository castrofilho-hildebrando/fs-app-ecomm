import {
    ListMyOrdersUseCase,
    ListMyOrdersInput,
    OrderSummary
} from "./ListMyOrdersUseCase"

import { OrderRepository } from "../ports/OrderRepository"

export class ListMyOrdersUseCaseImpl
implements ListMyOrdersUseCase {

    constructor(
        private readonly orderRepository: OrderRepository
    ) {}                                    

    async execute(
        { userId }: ListMyOrdersInput
    ): Promise<OrderSummary[]> {

        return this.orderRepository.findByUserId(userId)
    }
}
