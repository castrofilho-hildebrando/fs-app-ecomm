export interface OrderRepository {

    findById(id: string): Promise<{
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: string;
    } | null>;

    findByUserId(userId: string): Promise<{
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: string;
    }[]>;

    findAll(): Promise<{
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: string;
        createdAt: Date;
    }[]>;

    create(data: {
        userId: string;
        items: any[];
        total: number;
        status: string;
    }): Promise<{
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: string;
    }>;

    updateStatus(id: string, status: string): Promise<{
        id: string;
        userId: string;
        items: any[];
        total: number;
        status: string;
    } | null>;

    create(order: any): Promise<any>; // Adiciona esta linha
}
