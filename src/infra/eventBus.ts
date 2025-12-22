import { EventBus } from "../domain/events/EventBus"
import { OrderCreatedEvent } from "../domain/events/OrderCreatedEvent"
import { SendOrderEmailHandler } from "../application/handlers/SendOrderEmailHandler"
import { UpdateSalesMetricsHandler } from "../application/handlers/UpdateSalesMetricsHandler"

export const eventBus = new EventBus()

// wiring
eventBus.subscribe(

    OrderCreatedEvent,
    new SendOrderEmailHandler()
)

eventBus.subscribe(

    OrderCreatedEvent,
    new UpdateSalesMetricsHandler()
)
