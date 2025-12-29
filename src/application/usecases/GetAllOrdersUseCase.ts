export type OrderSummary = {

    id: string;
    userId: string;
    status: string;
    total: number;
    createdAt: Date;
};

export type GetAllOrdersInput = {

    actor: {
        id: string;
        role: "admin" | "user";
    };
};

export interface GetAllOrdersUseCase {

    execute(input: GetAllOrdersInput): Promise<OrderSummary[]>;
}
