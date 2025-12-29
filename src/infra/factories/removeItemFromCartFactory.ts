import { RemoveItemFromCartUseCase } from "../../application/usecases/RemoveItemFromCartUseCase"
import { RemoveItemFromCartUseCaseImpl } from "../../application/usecases/RemoveItemFromCartUseCaseImpl"

import { MongoCartRepository } from "../repositories/MongoCartRepository"

export function makeRemoveItemFromCartUseCase(): RemoveItemFromCartUseCase {
    
    const cartRepository = new MongoCartRepository()

    return new RemoveItemFromCartUseCaseImpl(
    
        cartRepository
    )
}
