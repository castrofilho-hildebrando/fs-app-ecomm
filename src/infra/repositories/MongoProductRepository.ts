import { Product } from "../models/Product"

export class MongoProductRepository {
    async findById(id: string) {
        const product = await Product.findById(id)
        if (!product) return null
        return {
            id: product._id.toString(),
            _id: product._id.toString(),
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
        }
    }

    async findByIds(ids: string[]) {
        const products = await Product.find({ _id: { $in: ids } })
        return products.map(p => ({
            id: p._id.toString(),
            _id: p._id.toString(),
            name: p.name,
            price: p.price,
            stock: p.stock,
            description: p.description,
        }))
    }

    async decrementStock(productId: string, quantity: number): Promise<void> {
        await Product.updateOne({ _id: productId }, { $inc: { stock: -quantity } })
    }

    async findAll() {
        const products = await Product.find()
        return products.map(p => ({
            id: p._id.toString(),
            _id: p._id.toString(),
            name: p.name,
            price: p.price,
            stock: p.stock,
            description: p.description,
        }))
    }

    async create(data: { name: string; price: number; stock?: number; description?: string }) {
        const created = await Product.create({
            name: data.name,
            price: data.price,
            stock: data.stock ?? 0,
            description: data.description ?? "",
        })
        return {
            _id: created._id.toString(),
            name: created.name,
            price: created.price,
            stock: created.stock,
            description: created.description,
        }
    }

    async update(id: string, data: { name?: string; price?: number; stock?: number; description?: string }) {
        const updated = await Product.findByIdAndUpdate(id, data, { new: true })
        if (!updated) return null
        return {
            _id: updated._id.toString(),
            name: updated.name,
            price: updated.price,
            stock: updated.stock,
            description: updated.description,
        }
    }

    async delete(id: string) {
        const res = await Product.findByIdAndDelete(id)
        return !!res
    }
}
