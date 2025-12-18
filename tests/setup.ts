import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replset: MongoMemoryReplSet;

beforeAll(async () => {

    replset = await MongoMemoryReplSet.create({

        replSet: { count: 1 },
    });

    const uri = replset.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {

    await mongoose.disconnect();
    await replset.stop();
});
