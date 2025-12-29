import {
    AddItemToCartUseCase,
    AddItemToCartInput,
} from "./AddItemToCartUseCase"

import { CartRepository } from "../ports/CartRepository"
import { ProductRepository } from "../ports/ProductRepository"

import { ProductNotFoundError } from "../../domain/errors/ProductNotFoundError"
import { InsufficientStockError } from "../../domain/errors/CheckoutErrors"

export class AddItemToCartUseCaseImpl implements AddItemToCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) {}

    async execute({
        userId,
        productId,
        quantity,
    }: AddItemToCartInput): Promise<void> {

        // 1. Verificar se o produto existe
        const product = await this.productRepository.findById(productId)

        if (!product) {
            throw new ProductNotFoundError(productId)
        }

        // 2. Verificar estoque
        if (product.stock < quantity) {
            throw new InsufficientStockError(
                productId,
                product.stock,
                quantity
            )
        }

        // 3. Delegar a persistência ao repositório
        await this.cartRepository.addItem(
            userId,
            productId,
            quantity
        )
    }
}
