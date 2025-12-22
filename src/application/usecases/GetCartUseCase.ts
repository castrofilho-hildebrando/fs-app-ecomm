export type GetCartInput = {

    userId: string;
};

export type CartItemOutput = {

    productId: string;
    quantity: number;
};

export type CartOutput = {

    items: CartItemOutput[];
};

export interface GetCartUseCase {

    execute(input: GetCartInput): Promise<CartOutput>;
}
