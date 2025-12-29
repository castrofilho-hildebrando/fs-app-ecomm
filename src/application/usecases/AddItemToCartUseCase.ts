export type AddItemToCartInput = {
    userId: string;
    productId: string;
    quantity: number;
};

export interface AddItemToCartUseCase {
    execute(input: AddItemToCartInput): Promise<void>;
}
