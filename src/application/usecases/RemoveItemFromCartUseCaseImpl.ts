import {
    RemoveItemFromCartUseCase,
    RemoveItemFromCartInput,
} from "./RemoveItemFromCartUseCase"

import { CartRepository } from "../ports/CartRepository"
import { CartNotFoundError } from "../../domain/errors/CartNotFoundError"

export class RemoveItemFromCartUseCaseImpl
implements RemoveItemFromCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository
    ) {}

    async execute( { userId, productId }: RemoveItemFromCartInput ): Promise<void> {

        const cart = await this.cartRepository.findByUserId(userId)
        if (!cart) {
            throw new CartNotFoundError(`Cart for user ${userId} not found`)
        }
        await this.cartRepository.removeItem(userId, productId)
    }
}
