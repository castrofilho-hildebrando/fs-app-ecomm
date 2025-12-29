import { AddItemToCartUseCase } from "../../application/usecases/AddItemToCartUseCase"
import { AddItemToCartUseCaseImpl } from "../../application/usecases/AddItemToCartUseCaseImpl"

import { MongoCartRepository } from "../repositories/MongoCartRepository"
import { MongoProductRepository } from "../repositories/MongoProductRepository"

export function makeAddItemToCartUseCase() {

    return new AddItemToCartUseCaseImpl(

        new MongoCartRepository(),
        new MongoProductRepository()
    )
}
