import { ApplicationEvent } from "../events/ApplicationEvent"

export interface OutboxRepository {

    save(event: ApplicationEvent): Promise<void>;
}
