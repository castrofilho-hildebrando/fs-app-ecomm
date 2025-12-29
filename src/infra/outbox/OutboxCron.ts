import cron from "node-cron"
import { MongoOutboxDispatcher } from "./MongoOutboxDispatcher"

const dispatcher = new MongoOutboxDispatcher()

cron.schedule("*/10 * * * * *", async () => {

    await dispatcher.dispatch()
})
