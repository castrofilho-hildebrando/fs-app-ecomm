import { ClearCartUseCase } from "../../application/usecases/ClearCartUseCase"
import { ClearCartUseCaseImpl } from "../../application/usecases/ClearCartUseCaseImpl"

import { MongoCartRepository } from "../repositories/MongoCartRepository"

export function makeClearCartUseCase(): ClearCartUseCase {

    return new ClearCartUseCaseImpl(

        new MongoCartRepository()
    )
}
