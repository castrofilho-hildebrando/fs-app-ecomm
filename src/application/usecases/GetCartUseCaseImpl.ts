import { GetCartUseCase, GetCartInput, CartOutput } from "./GetCartUseCase"
import { CartRepository } from "../ports/CartRepository"

export class GetCartUseCaseImpl
implements GetCartUseCase {

    constructor(

        private readonly cartRepository: CartRepository
    ) {}

    async execute({ userId }: GetCartInput): Promise<CartOutput> {

        const cart = await this.cartRepository.findByUserId(userId)

        return {

            items: cart?.items ?? []
        }
    }
}
