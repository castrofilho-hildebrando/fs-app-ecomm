import { Outbox } from "../models/Outbox"
import { OutboxDispatcher } from "./OutboxDispatcher"
import { OrderPlacedHandler } from "./handlers/OrderPlacedHandler"
import { ApplicationEvent } from "../../application/events/ApplicationEvent"

type EventHandler = {
    handle(event: ApplicationEvent): Promise<void>;
};

export class MongoOutboxDispatcher {

    private readonly handlers: Record<string, EventHandler> = {
        "order.placed": new OrderPlacedHandler(),
    }

    async dispatch(): Promise<void> {

        const events = await Outbox.find({
            processed: false,
        })

        for (const event of events) {

            const handler = this.handlers[event.name]

            if (!handler) {
                // evento desconhecido → marcar como processado
                event.processed = true
                event.processedAt = new Date()
                await event.save()
                continue
            }

            await handler.handle({
                name: event.name,
                payload: event.payload,
                occurredAt: event.occurredAt,
            })

            event.processed = true
            event.processedAt = new Date()
            await event.save()
        }
    }
}
