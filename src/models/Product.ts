import { Schema, model, Document } from "mongoose"

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
})

export const Product = model<IProduct>("Product", ProductSchema)
