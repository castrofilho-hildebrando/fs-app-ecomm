export interface DomainEventHandler<T> {
    handle(event: T): Promise<void> | void;
}
