import { DomainError } from "./DomainError"

export class AccessDeniedError extends DomainError {

    constructor(code: string, message: string = "Access denied") {

        super(code, message)
    }
}
