export type CheckoutInput = {

    userId: string;
};

export type CheckoutOutput = {

    orderId: string;
    status: string;
    total: number;
};

export interface CheckoutUseCase {

    execute(input: CheckoutInput): Promise<CheckoutOutput>;
}
