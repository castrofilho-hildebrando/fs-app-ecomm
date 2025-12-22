import { ClearCartUseCase, ClearCartInput } from "./ClearCartUseCase";
import { CartRepository } from "../ports/CartRepository";

export class ClearCartUseCaseImpl implements ClearCartUseCase {

    constructor(
        private readonly cartRepository: CartRepository
    ) {}

    async execute({ userId }: ClearCartInput): Promise<void> {

        await this.cartRepository.clearByUserId(userId);
    }
}
