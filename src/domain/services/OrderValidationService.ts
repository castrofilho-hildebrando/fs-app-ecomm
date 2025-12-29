import { OrderItem } from "../types/OrderItem"
import { ProductSnapshot } from "../types/ProductSnapshot"
import { ProductNotFoundError, InsufficientStockError } from "../errors/CheckoutErrors"

export class OrderValidationService {
    validateAndCalculateTotal(items: OrderItem[], products: ProductSnapshot[]): number {
        const productMap: Record<string, ProductSnapshot> = {}
        for (const product of products) {
            productMap[product.id] = product
        }

        let total = 0

        for (const item of items) {
            const product = productMap[item.productId]

            if (!product) {
                throw new ProductNotFoundError(item.productId)
            }

            if (product.stock < item.quantity) {
                throw new InsufficientStockError(item.productId, product.stock, item.quantity)
            }

            total += product.price * item.quantity
        }

        return total
    }
}
