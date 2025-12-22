export class OrderCreatedEvent {

    readonly occurredAt: Date

    constructor(
        public readonly orderId: string,
        public readonly userId: string,
        public readonly total: number
    ) {

        this.occurredAt = new Date()
    }
}
