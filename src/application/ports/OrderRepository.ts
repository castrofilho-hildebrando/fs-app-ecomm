export interface OrderRepository {
    findById(id: string): Promise<{
        id: string;
        status: string;
        userId: string;
    } | null>;

    findByUserId(userId: string): Promise<{
        id: string;
        status: string;
        total: number;
        createdAt: Date;
    }[]>;

    findAll(): Promise<{
        id: string;
        userId: string;
        status: string;
        total: number;
        createdAt: Date;
    }[]>;

    create(data: {
        userId: string;
        items: { productId: string; quantity: number }[];
        total: number;
        status: string;
    }): Promise<{ id: string }>;

    updateStatus(orderId: string, status: string): Promise<void>;
}
