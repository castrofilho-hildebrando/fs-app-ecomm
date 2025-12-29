export class CartNotFoundError extends Error {

    public readonly userId: string

    constructor(userId: string) {
        super(`Cart not found for user ${userId}`)
        this.name = "CartNotFoundError"
        this.userId = userId
    }
}

