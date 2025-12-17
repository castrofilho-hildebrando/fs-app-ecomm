import { InsufficientStockError, ProductNotFoundError } from "../errors/CheckoutErrors";
import { IProduct } from "../../models/Product";

interface CartItem {
    productId: string;
    quantity: number;
}

export class OrderDomainService {

    calculateTotalAndValidate(
        items: CartItem[],
        products: IProduct[]
    ): number {

        const productMap = products.reduce((acc, product) => {
            acc[product._id.toString()] = product;
            return acc;
        }, {} as Record<string, IProduct>);

        let total = 0;

        for (const item of items) {
            const product = productMap[item.productId.toString()];

            if (!product) {
                throw new ProductNotFoundError(item.productId.toString());
            }

            if (product.stock < item.quantity) {
                throw new InsufficientStockError(
                    product.name,
                    product.stock,
                    item.quantity
                );
            }

            total += product.price * item.quantity;
        }

        return total;
    }
}
