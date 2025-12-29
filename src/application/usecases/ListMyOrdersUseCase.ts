export type ListMyOrdersInput = {
    userId: string;
};

export type OrderSummary = {
    id: string;
    status: string;
    total: number;
    createdAt?: Date;
};

export interface ListMyOrdersUseCase {
    execute(input: ListMyOrdersInput): Promise<OrderSummary[]>;
}
