import { DomainEventHandler } from "./DomainEventHandler"

type EventClass<T> = new (...args: any[]) => T;

export class EventBus {

    private handlers = new Map<string, DomainEventHandler<any>[]>()

    subscribe<T extends object>(
        event: EventClass<T>,
        handler: DomainEventHandler<T>
    ) {

        const eventName = event.name

        const existing = this.handlers.get(eventName) ?? []
        existing.push(handler)

        this.handlers.set(eventName, existing)
    }

    async publish<T extends object>(event: T) {

        const eventName = event.constructor.name
        const handlers = this.handlers.get(eventName) ?? []

        for (const handler of handlers) {
            await handler.handle(event)
        }
    }
}
