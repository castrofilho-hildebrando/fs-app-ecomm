import { Request, Response } from "express"
import { MongoProductRepository } from "../infra/repositories/MongoProductRepository"

const productRepository = new MongoProductRepository()

// GET /api/products — rota pública
export async function getAllProducts(req: Request, res: Response) {
    try {
        const products = await productRepository.findAll()
        return res.status(200).json(products)   // 🔹 já vem com _id
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error)
        return res.status(500).json({ error: "Erro interno" })
    }
}

export async function createProduct(req: Request, res: Response) {
    try {
        const user = req.user
        if (!user) return res.status(401).json({ message: "Unauthorized" })
        if (user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

        const { name, price, stock, description } = req.body
        if (!name || price === undefined) {
            return res.status(400).json({ error: "Campos obrigatórios: name e price" })
        }

        const created = await productRepository.create({
            name,
            price,
            stock: stock ?? 0,
            description: description ?? "",
        })

        // 🔹 garantir que _id esteja presente no objeto retornado
        return res.status(201).json({
            product: {
                _id: created._id,
                name: created.name,
                price: created.price,
                stock: created.stock,
                description: created.description,
            }
        })
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error)
        return res.status(500).json({ error: "Erro interno" })
    }
}

export async function updateProduct(req: Request, res: Response) {

    try {

        const user = req.user

        if (!user) {

            return res.status(401).json({ message: "Unauthorized" })
        }

        if (user.role !== "admin") {

            return res.status(403).json({ message: "Forbidden" })
        }

        const { id } = req.params
        if (!id) {

            return res.status(400).json({ message: "Product id is required" })
        }

        const { name, price, stock, description } = req.body

        const updated = await productRepository.update(id, {
            name,
            price,
            stock,
            description,
        })

        if (!updated) return res.status(404).json({ message: "Produto não encontrado" })

        // 🔹 garantir que _id esteja presente
        return res.status(200).json({
            product: {
                _id: updated._id,
                name: updated.name,
                price: updated.price,
                stock: updated.stock,
                description: updated.description,
            }
        })
    }

    catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error)
        return res.status(500).json({ error: "Erro interno" })
    }
}

// DELETE /api/products/:id — apenas admin
export async function deleteProduct(req: Request, res: Response) {
    try {
        const user = req.user
        if (!user) return res.status(401).json({ message: "Unauthorized" })
        if (user.role !== "admin") return res.status(403).json({ message: "Forbidden" })

        const { id } = req.params
        if (!id) {

            return res.status(400).json({ message: "Product id is required" })
        }

        const deleted = await productRepository.delete(id)

        if (!deleted) return res.status(404).json({ message: "Produto não encontrado" })

        // 🔹 manter consistência: resposta dentro de product
        return res.status(200).json({ product: { deleted: true, _id: id } })
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error)
        return res.status(500).json({ error: "Erro interno" })
    }
}

