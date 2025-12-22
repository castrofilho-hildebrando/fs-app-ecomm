import { AddItemToCartUseCase, AddItemToCartInput } from "./AddItemToCartUseCase"
import { CartRepository } from "../ports/CartRepository"
import { ProductRepository } from "../ports/ProductRepository"
import { DomainError } from "../../domain/errors/DomainError"

export class AddItemToCartUseCaseImpl implements AddItemToCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ) {}

    async execute({ userId, productId, quantity }: AddItemToCartInput): Promise<void> {

        if (quantity <= 0) {
            throw new DomainError("Quantity must be greater than zero")
        }

        const product = await this.productRepository.findById(productId)
        if (!product) {
            throw new DomainError("Product not found")
        }

        const cart = await this.cartRepository.findByUserId(userId)

        const items = cart?.items ?? []

        const existingItem = items.find(i => i.productId === productId)

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            items.push({ productId, quantity })
        }

        await this.cartRepository.save(userId, items)
    }
}
