import { DomainError } from "./DomainError"

export class OrderWithoutItemsError extends DomainError {

    constructor(code: string, message: string = "Access denied") {

        super(code, message)
    }
}
