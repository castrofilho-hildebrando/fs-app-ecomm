import { Schema, model, Document, Types } from "mongoose"

export interface IOrder extends Document {

    userId: Types.ObjectId;
    items: { productId: Types.ObjectId; quantity: number }[];
    total: number;
    status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
    createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({

    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true },
        },
    ],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "paid", "shipped", "completed", "cancelled"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
})

export const Order = model<IOrder>("Order", OrderSchema)
