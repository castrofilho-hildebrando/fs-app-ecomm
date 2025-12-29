import mongoose, { Schema, Document } from "mongoose"

export interface IProduct extends Document {
  name: string;
  price: number;
  stock: number;
  description?: string;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        description: { type: String, default: "" },
    },
    { timestamps: true }
)

// 🔹 Mongoose sempre cria o campo _id automaticamente
export const Product = mongoose.model<IProduct>("Product", productSchema)
