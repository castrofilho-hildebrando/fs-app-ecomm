import { ClearCartUseCase, ClearCartInput } from "./ClearCartUseCase"
import { CartRepository } from "../ports/CartRepository"

export class ClearCartUseCaseImpl implements ClearCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository
    ) {}

    async execute({ userId }: ClearCartInput): Promise<void> {

        const cart = await this.cartRepository.findByUserId(userId)

        // comportamento idempotente:
        // se o carrinho não existe, não é erro
        if (!cart) {
            return
        }

        await this.cartRepository.clear(userId)
    }
}
