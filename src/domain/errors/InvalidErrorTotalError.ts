import { DomainError } from "./DomainError"

export class InvalidErrorTotalError extends DomainError {

    constructor(code: string, message:string = "Access denied") {

        super(code, message)
    }
}
