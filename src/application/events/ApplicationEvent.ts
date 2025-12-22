export interface ApplicationEvent {

    readonly name: string;
    readonly occurredAt: Date;
    readonly payload: unknown;
}
