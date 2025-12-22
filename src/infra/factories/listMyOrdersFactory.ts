import { ListMyOrdersUseCase } from "../../application/usecases/ListMyOrdersUseCase"
import { ListMyOrdersUseCaseImpl } from "../../application/usecases/ListMyOrdersUseCaseImpl"

import { MongoOrderRepository } from "../repositories/MongoOrderRepository"

export function makeListMyOrdersUseCase(): ListMyOrdersUseCase {
    return new ListMyOrdersUseCaseImpl(
        new MongoOrderRepository()
    )
}
