import {
    GetAllOrdersUseCase,
    GetAllOrdersInput,
    OrderSummary
} from "./GetAllOrdersUseCase"

import { OrderRepository } from "../ports/OrderRepository"
import { DomainError } from "../../domain/errors/DomainError"

export class GetAllOrdersUseCaseImpl
implements GetAllOrdersUseCase {

    constructor(
        private readonly orderRepository: OrderRepository
    ) {}

    async execute(
        { actor }: GetAllOrdersInput
    ): Promise<OrderSummary[]> {

        if (actor.role !== "admin") {
            throw new DomainError("Access denied")
        }

        return this.orderRepository.findAll()
    }
}
