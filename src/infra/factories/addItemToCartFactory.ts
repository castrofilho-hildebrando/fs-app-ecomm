import { AddItemToCartUseCase } from "../../application/usecases/AddItemToCartUseCase";
import { AddItemToCartUseCaseImpl } from "../../application/usecases/AddItemToCartUseCaseImpl";

import { MongoCartRepository } from "../repositories/MongoCartRepository";
import { MongoProductRepository } from "../repositories/MongoProductRepository";

export function makeAddItemToCartUseCase(): AddItemToCartUseCase {
    
    const cartRepository = new MongoCartRepository();
    const productRepository = new MongoProductRepository();

    return new AddItemToCartUseCaseImpl(

        cartRepository,
        productRepository
    );
}
