export class ProductNotFoundError extends Error {
    public readonly productId: string
    public readonly code = "PRODUCT_NOT_FOUND"

    constructor(productId: string) {
        super(`Produto ${productId} não encontrado`)
        this.name = "ProductNotFoundError"
        this.productId = productId
    }
}
