import { Outbox } from "../models/Outbox";

export class OutboxDispatcher {

    async dispatch(): Promise<void> {

        const events = await Outbox.find({ processed: false });

        for (const event of events) {
            // aqui você decide:
            // - enviar email
            // - publicar em fila
            // - chamar webhook

            event.processed = true;
            await event.save();
        }
    }
}
