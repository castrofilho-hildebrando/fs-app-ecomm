import { Request, Response } from "express"
import { makeGetCartUseCase } from "../infra/factories/getCartFactory"
import { makeAddItemToCartUseCase } from "../infra/factories/addItemToCartFactory"
import { makeRemoveItemFromCartUseCase } from "../infra/factories/removeItemFromCartFactory"
import { makeClearCartUseCase } from "../infra/factories/clearCartFactory"

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        if (!userId) return res.status(401).json({ error: "Não autorizado" })

        const useCase = makeGetCartUseCase()
        const cart = await useCase.execute({ userId }) // objeto!
        // testes esperam items na raiz
        return res.status(200).json({ items: cart.items })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

export const addItemToCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        const { productId, quantity } = req.body

        if (!userId) return res.status(401).json({ error: "Não autorizado" })
        if (!productId || !quantity) {
            return res.status(400).json({ error: "Produto e quantidade são obrigatórios" })
        }

        const useCase = makeAddItemToCartUseCase()
        await useCase.execute({ userId, productId, quantity }) // objeto!

        const getUseCase = makeGetCartUseCase()
        const updatedCart = await getUseCase.execute({ userId })

        return res.status(200).json({ cart: updatedCart })
    }

    catch (error: any) {

        const code = error?.code
        const status = code === "PRODUCT_NOT_FOUND" ? 404 : 400
        return res.status(status).json({ error: error.message })
    }
}

export const removeItemFromCart = async (req: Request, res: Response) => {

    try {
        const userId = req.user?.userId
        const { productId } = req.body // ler do body

        if (!userId) return res.status(401).json({ error: "Não autorizado" })

        // checar existência do carrinho antes
        const getUseCase = makeGetCartUseCase()
        const existing = await getUseCase.execute({ userId })
        if (!existing || existing.items.length === 0) {
            return res.status(404).json({ error: "Carrinho não existe" })
        }

        const useCase = makeRemoveItemFromCartUseCase()
        await useCase.execute({ userId, productId })

        const updatedCart = await getUseCase.execute({ userId })

        return res.status(200).json({ cart: updatedCart })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}


export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        if (!userId) return res.status(401).json({ error: "Não autorizado" })

        const getUseCase = makeGetCartUseCase()
        const existing = await getUseCase.execute({ userId })
        if (!existing || existing.items.length === 0) {
            return res.status(404).json({ error: "Carrinho não existe" })
        }

        const useCase = makeClearCartUseCase()
        await useCase.execute({ userId })

        return res.status(200).json({ message: "Carrinho limpo com sucesso", cart: { items: [] } })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}
