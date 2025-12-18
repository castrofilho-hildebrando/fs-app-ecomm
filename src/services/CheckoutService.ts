import mongoose from "mongoose";

import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { Order } from "../models/Order"
import { Order as DomainOrder } from "../domain/entities/Order";

import { OrderDomainService } from "../domain/services/OrderDomainService";
import { CartEmptyError } from "../domain/errors/CheckoutErrors";

import { EventBus } from "../domain/events/EventBus";
import { OrderCreatedEvent } from "../domain/events/OrderCreatedEvent";

export class CheckoutService {

    private readonly orderDomainService = new OrderDomainService();

    constructor(

        private readonly eventBus: EventBus
    ) {}

    async execute(userId: string) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Buscar carrinho (dentro da transação)
            const cart = await Cart.findOne({ userId }).session(session);

            if (!cart || cart.items.length === 0) {
                throw new CartEmptyError();
            }

            // 2. Buscar produtos
            const productIds = cart.items.map(item => item.productId);

            const products = await Product.find({
                _id: { $in: productIds },
            }).session(session);

            // 3. Adaptar itens para o domínio
            const domainItems = cart.items.map(item => ({
                productId: item.productId.toString(),
                quantity: item.quantity,
            }));

            // 4. Regra de negócio (DOMÍNIO)
            const total =
                this.orderDomainService.calculateTotalAndValidate(
                    domainItems,
                    products
                );

            // 5. Criar pedido
            const domainOrder = new DomainOrder(

                "pending",
                cart.items.map(item => ({
                    productId: item.productId.toString(),
                    quantity: item.quantity,
                    price: products.find(
                        p => p._id.toString() === item.productId.toString()
                    )!.price,
                })),
                total
            );

            // Persistência continua com Mongoose
            const order = new Order({
                userId,
                items: cart.items,
                total: domainOrder.total,
                status: domainOrder.status,
            });

            await order.save({ session });

            // 6. Atualizar estoque
            for (const item of cart.items) {
                await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }

            // 7. Limpar carrinho
            cart.items = [];
            await cart.save({ session });

            // 8. Commit
            await session.commitTransaction();
            session.endSession();

            // Publicar pedido
            await this.eventBus.publish(

                new OrderCreatedEvent(

                    order._id.toString(),
                    order.userId.toString(),
                    order.total
                )
            );

            return order;

        } catch (error) {
            // 9. Rollback
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}
