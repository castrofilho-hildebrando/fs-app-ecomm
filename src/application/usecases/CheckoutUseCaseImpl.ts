import { CheckoutUseCase } from "./CheckoutUseCase"
import { CartRepository } from "../ports/CartRepository"
import { ProductRepository } from "../ports/ProductRepository"
import { OrderRepository } from "../ports/OrderRepository"
import { TransactionManager } from "../ports/TransactionManager"
import { ClearCartUseCase } from "./ClearCartUseCase"
import { OutboxRepository } from "../ports/OutboxRepository"
import { CartEmptyError } from "../../domain/errors/CheckoutErrors"
import { OrderValidationService } from "../../domain/services/OrderValidationService"

export class CheckoutUseCaseImpl implements CheckoutUseCase {
    constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
    private readonly transactionManager: TransactionManager,
    private readonly clearCartUseCase: ClearCartUseCase,
    private readonly outboxRepository: OutboxRepository   // ✅ novo parâmetro
    ) {}

    async execute(input: { userId: string }): Promise<{ orderId: string; status: string; total: number }> {
        return this.transactionManager.runInTransaction(async () => {
            const cart = await this.cartRepository.findByUserId(input.userId)
            if (!cart || cart.items.length === 0) {
                throw new CartEmptyError()
            }

            const products = await this.productRepository.findByIds(cart.items.map(i => i.productId))
            const total = new OrderValidationService().validateAndCalculateTotal(cart.items, products)

            for (const item of cart.items) {
                await this.productRepository.decrementStock(item.productId, item.quantity)
            }

            const order = await this.orderRepository.create({
                userId: input.userId,
                items: cart.items,
                total,
                status: "pending",
            })

            await this.clearCartUseCase.execute({ userId: input.userId })

            // 🔥 Persistir evento no Outbox
            await this.outboxRepository.save({
                name: "order.placed",
                payload: {
                    orderId: order.id,
                    userId: input.userId,
                    total,
                },
                occurredAt: new Date(),
            })

            return { orderId: order.id, status: "pending", total }
        })
    }
}
