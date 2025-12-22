import {
    CheckoutUseCase,
    CheckoutInput,
    CheckoutOutput,
} from "./CheckoutUseCase";

import { ClearCartUseCase } from "./ClearCartUseCase";

import { CartRepository } from "../ports/CartRepository";
import { ProductRepository } from "../ports/ProductRepository";
import { OrderRepository } from "../ports/OrderRepository";
import { TransactionManager } from "../ports/TransactionManager";
import { OutboxRepository } from "../ports/OutboxRepository";

import { Order } from "../../domain/entities/Order";
import { OrderValidationService } from "../../domain/services/OrderValidationService";
import { CartEmptyError } from "../../domain/errors/CheckoutErrors";

import { OrderPlacedEvent } from "../events/OrderPlacedEvent";

export class CheckoutUseCaseImpl implements CheckoutUseCase {

    private readonly orderDomainService = new OrderValidationService();

    constructor(
        private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository,
        private readonly orderRepository: OrderRepository,
        private readonly transactionManager: TransactionManager,
        private readonly clearCartUseCase: ClearCartUseCase,
        private readonly outboxRepository: OutboxRepository
    ) {}

    async execute({ userId }: CheckoutInput): Promise<CheckoutOutput> {

        return this.transactionManager.runInTransaction(async () => {

            const cart = await this.cartRepository.findByUserId(userId);

            if (!cart || cart.items.length === 0) {
                throw new CartEmptyError();
            }

            const productIds = cart.items.map(i => i.productId);
            const products = await this.productRepository.findByIds(productIds);

            const domainItems = cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
            }));

            const total =
                this.orderDomainService.validateAndCalculateTotal(
                    domainItems,
                    products
                );

            const order = new Order(
                "pending",
                cart.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: products.find(p => p.id === item.productId)!.price,
                })),
                total
            );

            const { id: orderId } = await this.orderRepository.create({
                userId,
                items: cart.items,
                total: order.total,
                status: order.status,
            });

            for (const item of cart.items) {
                await this.productRepository.decrementStock(
                    item.productId,
                    item.quantity
                );
            }

            await this.clearCartUseCase.execute({ userId });

            await this.outboxRepository.save(
                new OrderPlacedEvent({
                    orderId,
                    userId,
                    total
                })
            );

            return {
                orderId,
                status: order.status,
                total
            };
        });
    }
}
