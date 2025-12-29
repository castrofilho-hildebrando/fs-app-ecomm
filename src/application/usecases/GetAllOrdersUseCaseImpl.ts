import {
    GetAllOrdersUseCase,
    GetAllOrdersInput,
    OrderSummary
} from "./GetAllOrdersUseCase"

import { OrderRepository } from "../ports/OrderRepository"
import { AccessDeniedError } from "../../domain/errors/AccessDeniedError"

export class GetAllOrdersUseCaseImpl
implements GetAllOrdersUseCase {

    constructor(

        private readonly orderRepository: OrderRepository
    ) {}

    async execute(
        { actor }: GetAllOrdersInput
    ): Promise<OrderSummary[]> {

        if (actor.role !== "admin") {
            throw new AccessDeniedError("ACCESS_DENIED", "Access denied")
        }

        return this.orderRepository.findAll()
    }
}
