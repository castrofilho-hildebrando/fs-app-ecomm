import { Outbox } from "../models/Outbox"
import { OutboxRepository } from "../../application/ports/OutboxRepository"
import { ApplicationEvent } from "../../application/events/ApplicationEvent"

export class MongoOutboxRepository implements OutboxRepository {

    async save(event: ApplicationEvent): Promise<void> {

        await Outbox.create({
            name: event.name,
            payload: event.payload,
            occurredAt: event.occurredAt,
            processed: false
        })
    }
}
