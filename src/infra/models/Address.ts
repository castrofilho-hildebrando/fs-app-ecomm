import mongoose, { Document, Schema } from "mongoose"

// 1. Definição da Interface
export interface IAddress extends Document {
    userId: mongoose.Types.ObjectId;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

// 2. Definição do Schema
const AddressSchema: Schema = new Schema({
    // Referência ao usuário
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: "Brazil" },
    
    // Se este é o endereço padrão do usuário
    isDefault: { type: Boolean, default: false },
}, {
    timestamps: true 
})

// 3. Exportação do Modelo
export const Address = mongoose.model<IAddress>("Address", AddressSchema)