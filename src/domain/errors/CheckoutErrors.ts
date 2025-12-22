import { DomainError } from "./DomainError"

export class CartEmptyError extends DomainError {

    constructor() {

        super("CART_EMPTY", "Carrinho vazio")
    }
}

export class ProductNotFoundError extends DomainError {

    constructor(productId?: string) {

        super(

            "PRODUCT_NOT_FOUND",
            productId
                ? `Produto ${productId} não encontrado`
                : "Produto não encontrado"
        )
    }
}

export class InsufficientStockError extends DomainError {

    constructor(productName: string, available: number, requested: number) {

        super(

            "INSUFFICIENT_STOCK",
            `Estoque insuficiente para ${productName}. Disponível: ${available}, solicitado: ${requested}`
        )
    }
}
