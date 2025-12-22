import { RemoveItemFromCartUseCase, RemoveItemFromCartInput } from "./RemoveItemFromCartUseCase"
import { CartRepository } from "../ports/CartRepository"

export class RemoveItemFromCartUseCaseImpl implements RemoveItemFromCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository
    ) {}

    async execute({ userId, productId }: RemoveItemFromCartInput): Promise<void> {
        const cart = await this.cartRepository.findByUserId(userId)

        if (!cart) {
            return
        }

        const filteredItems = cart.items.filter(
            item => item.productId !== productId
        )

        await this.cartRepository.save(userId, filteredItems)
    }
}
