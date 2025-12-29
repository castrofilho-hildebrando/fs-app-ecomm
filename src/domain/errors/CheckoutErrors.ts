import { DomainError } from "./DomainError"

export class CartEmptyError extends DomainError {
    constructor() {
        super("CART_EMPTY", "Carrinho vazio")
        this.name = "CartEmptyError"
    }
}

export class ProductNotFoundError extends DomainError {
    constructor(productId?: string) {
        super(
            "PRODUCT_NOT_FOUND",
            productId ? `Produto ${productId} não encontrado` : "Produto não encontrado"
        )
        this.name = "ProductNotFoundError"
    }
}

export class InsufficientStockError extends DomainError {
    constructor(productId: string, available: number, requested: number) {
        super(
            "INSUFFICIENT_STOCK",
            `Estoque insuficiente para o produto ${productId}. Disponível: ${available}, solicitado: ${requested}`
        )
        this.name = "InsufficientStockError"
    }
}
