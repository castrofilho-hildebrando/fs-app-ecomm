import { DomainError } from "./DomainError"

export class OrderNotFoundError extends DomainError {

    constructor(code: string, message: string = "Order not found") {

        super(code, message)
    }
}
