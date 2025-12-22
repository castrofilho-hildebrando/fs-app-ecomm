import { OrderItem } from "../types/OrderItem"
import { ProductSnapshot } from "../types/ProductSnapshot"
import { DomainError } from "../errors/DomainError"

export class OrderValidationService {

    validateAndCalculateTotal(
        items: OrderItem[],
        products: ProductSnapshot[]
    ): number {

        const productMap: Record<string, ProductSnapshot> = {}

        for (const product of products) {
            productMap[product.id] = product
        }

        let total = 0

        for (const item of items) {
            const product = productMap[item.productId]

            if (!product) {
                throw new DomainError(
                    `Product not found: ${item.productId}`
                )
            }

            if (product.stock < item.quantity) {
                throw new DomainError(
                    `Insufficient stock for product: ${item.productId}`
                )
            }

            total += product.price * item.quantity
        }

        return total
    }
}
