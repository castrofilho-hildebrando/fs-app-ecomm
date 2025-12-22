export type ProductData = {

    id: string;
    price: number;
    stock: number;
};

export interface ProductRepository {

    findById(id: string): Promise<{

        id: string;
        stock: number;
    } | null>;

    findByIds(ids: string[]): Promise<ProductData[]>;
    decrementStock(productId: string, quantity: number): Promise<void>;
}


