import { GetCartUseCase } from "../../application/usecases/GetCartUseCase"
import { GetCartUseCaseImpl } from "../../application/usecases/GetCartUseCaseImpl"

import { MongoCartRepository } from "../repositories/MongoCartRepository"

export function makeGetCartUseCase(): GetCartUseCase {

    return new GetCartUseCaseImpl(

        new MongoCartRepository()
    )
}