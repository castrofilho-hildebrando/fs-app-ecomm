import mongoose from "mongoose"
import { TransactionManager } from "../../application/ports/TransactionManager"

export class MongoTransactionManager implements TransactionManager {

    async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
        const session = await mongoose.startSession()
        session.startTransaction()

        try {
            const result = await fn()
            await session.commitTransaction()
            return result
        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            await session.endSession()
        }
    }
}
