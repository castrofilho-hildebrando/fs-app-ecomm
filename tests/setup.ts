import mongoose from "mongoose"
import { MongoMemoryReplSet } from "mongodb-memory-server"
import * as dotenv from "dotenv"

dotenv.config()
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret"

let replset: MongoMemoryReplSet

beforeAll(async () => {

    replset = await MongoMemoryReplSet.create({

        replSet: { count: 1 },
    })

    const uri = replset.getUri()
    await mongoose.connect(uri)
})

afterAll(async () => {

    await mongoose.disconnect()
    await replset.stop()
})
