import { DomainEventHandler } from "../../domain/events/DomainEventHandler"
import { OrderCreatedEvent } from "../../domain/events/OrderCreatedEvent"

export class UpdateSalesMetricsHandler
implements DomainEventHandler<OrderCreatedEvent> {

    async handle(event: OrderCreatedEvent) {
        console.log(
            `[METRICS] Nova venda registrada: R$ ${event.total}`
        )
    }
}
