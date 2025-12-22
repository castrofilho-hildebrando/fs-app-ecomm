export type CartItemData = {
    productId: string;
    quantity: number;
};

export type CartData = {
    id: string;
    items: CartItemData[];
};

export interface CartRepository {

    findByUserId(userId: string): Promise<{

        items: { productId: string; quantity: number }[];
    } | null>;

    save(

        userId: string,
        items: { productId: string; quantity: number }[]
    ): Promise<void>;

    clearByUserId(userId: string): Promise<void>;
}

