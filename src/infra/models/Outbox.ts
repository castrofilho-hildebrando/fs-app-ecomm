import { Schema, model } from "mongoose"

const OutboxSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        payload: {
            type: Schema.Types.Mixed,
            required: true,
        },

        occurredAt: {
            type: Date,
            required: true,
        },

        processed: {
            type: Boolean,
            required: true,
            default: false,
        },

        processedAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
)

export const Outbox = model("Outbox", OutboxSchema)
