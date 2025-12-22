import { DomainEventHandler } from "../../domain/events/DomainEventHandler"
import { OrderCreatedEvent } from "../../domain/events/OrderCreatedEvent"

export class SendOrderEmailHandler
implements DomainEventHandler<OrderCreatedEvent> {

    async handle(event: OrderCreatedEvent) {
        console.log(
            `[EMAIL] Pedido ${event.orderId} criado para usuário ${event.userId}`
        )
    }
}
