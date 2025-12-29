import { Schema, model, Document, Types } from "mongoose"

export interface ICart extends Document {
    userId: Types.ObjectId;
    items: { productId: Types.ObjectId; quantity: number }[];
    createdAt: Date;
}

const CartSchema = new Schema<ICart>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true },
        },
    ],
    // Adicionado no Schema para criar a data automaticamente
    createdAt: { type: Date, default: Date.now },
})

export const Cart = model<ICart>("Cart", CartSchema)
