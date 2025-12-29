import { ApplicationEvent } from "./ApplicationEvent"

export class OrderPlacedEvent implements ApplicationEvent {

    readonly name = "order.placed"
    readonly occurredAt = new Date()

    constructor(

        public readonly payload: {

            orderId: string;
            userId: string;
            total: number;
        }
    ) {}
}
