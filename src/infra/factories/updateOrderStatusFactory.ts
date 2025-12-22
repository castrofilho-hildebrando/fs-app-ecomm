import { UpdateOrderStatusUseCase } from "../../application/usecases/UpdateOrderStatusUseCase"
import { UpdateOrderStatusUseCaseImpl } from "../../application/usecases/UpdateOrderStatusUseCaseImpl"

import { MongoOrderRepository } from "../repositories/MongoOrderRepository"

export function makeUpdateOrderStatusUseCase(): UpdateOrderStatusUseCase {

    return new UpdateOrderStatusUseCaseImpl(

        new MongoOrderRepository()
    )
}
