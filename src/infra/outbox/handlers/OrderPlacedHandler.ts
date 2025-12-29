import { ApplicationEvent } from "../../../application/events/ApplicationEvent"

export class OrderPlacedHandler {

    async handle(event: ApplicationEvent): Promise<void> {

        const { orderId, userId, total } = event.payload as {
            orderId: string;
            userId: string;
            total: number;
        }

        // efeitos colaterais reais
        // ex:
        // await emailService.sendOrderConfirmation(...)
        // await analytics.trackOrder(...)
        // await logger.info(...)

        console.log(
            "[OrderPlacedHandler]",
            { orderId, userId, total }
        )
    }
}
