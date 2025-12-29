import { DomainError } from "./DomainError"

export class OnlyAdminCanChangeOrderStatusError extends DomainError {

    constructor(code: string, message:string = "Access denied") {

        super(code, message)
    }
}
