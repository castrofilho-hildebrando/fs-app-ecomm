import { Request, Response } from "express"
import { Product } from "../models/Product"

// Lógica para criar produto
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, stock } = req.body
        // Validação básica se quiser adicionar
        if (!name || !price) {
            return res
                .status(400)
                .json({ error: "Nome e preço são obrigatórios" })
        }

        const newProduct = new Product({ name, description, price, stock })
        await newProduct.save()
        res.status(201).json({
            message: "Produto criado com sucesso!",
            product: newProduct,
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar produto" })
    }
}

// Lógica para listar produtos
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await Product.find()
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar produtos" })
    }
}

// Lógica para atualizar produto
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
            new: true,
        })
        if (!updatedProduct) {
            return res.status(404).json({ error: "Produto não encontrado" })
        }

        res.json({
            message: "Produto atualizado com sucesso!",
            product: updatedProduct,
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar produto" })
    }
}

// Lógica para deletar produto
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const deletedProduct = await Product.findByIdAndDelete(id)
        if (!deletedProduct) {
            return res.status(404).json({ error: "Produto não encontrado" })
        }

        res.json({ message: "Produto removido com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover produto" })
    }
}
