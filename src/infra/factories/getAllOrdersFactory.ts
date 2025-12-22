import { GetAllOrdersUseCase } from "../../application/usecases/GetAllOrdersUseCase"
import { GetAllOrdersUseCaseImpl } from "../../application/usecases/GetAllOrdersUseCaseImpl"

import { MongoOrderRepository } from "../repositories/MongoOrderRepository"

export function makeGetAllOrdersUseCase(): GetAllOrdersUseCase {

    return new GetAllOrdersUseCaseImpl(

        new MongoOrderRepository()
    )
}
