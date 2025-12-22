export type RemoveItemFromCartInput = {
    userId: string;
    productId: string;
};

export interface RemoveItemFromCartUseCase {
    execute(input: RemoveItemFromCartInput): Promise<void>;
}
