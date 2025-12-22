export type GetAllOrdersInput = {
    actor: {
        id: string;
        role: "admin" | "user";
    };
};

export type OrderSummary = {
    id: string;
    userId: string;
    status: string;
    total: number;
    createdAt: Date;
};

export interface GetAllOrdersUseCase {
    execute(input: GetAllOrdersInput): Promise<OrderSummary[]>;
}
