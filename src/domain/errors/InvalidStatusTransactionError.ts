import { DomainError } from "./DomainError"

export class InvalidStatusTransactionError extends DomainError {

    constructor(code: string, message: string = "Access denied") {

        super(code, message)
    }
}
