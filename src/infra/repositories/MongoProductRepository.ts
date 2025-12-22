import { Product } from "../../models/Product"
import { ProductRepository } from "../../application/ports/ProductRepository"

export class MongoProductRepository implements ProductRepository {

    async findById(id: string) {

        const product = await Product.findById(id);

        if (!product) return null;

        return {

            id: product._id.toString(),
            stock: product.stock
        };
    }

    async findByIds(ids: string[]) {

        const products = await Product.find({

            _id: { $in: ids },
        })

        return products.map(p => ({

            id: p._id.toString(),
            price: p.price,
            stock: p.stock
        }))
    }

    async decrementStock(
        productId: string,
        quantity: number
    ): Promise<void> {

        await Product.updateOne(

            { _id: productId },
            { $inc: { stock: -quantity } }
        )
    }
}
