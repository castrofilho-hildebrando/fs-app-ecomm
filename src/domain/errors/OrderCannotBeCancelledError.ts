import { DomainError } from "./DomainError"

export class OrderCannotBeCancelledError extends DomainError {

    constructor(code: string, message: string = "Access denied") {

        super(code, message)
    }
}
