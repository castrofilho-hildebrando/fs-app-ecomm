import { Request, Response } from "express"
import { Address } from "../infra/models/Address"
import mongoose from "mongoose"

// Função auxiliar para garantir que apenas um endereço seja o padrão
const ensureOnlyOneDefault = async (userId: mongoose.Types.ObjectId, currentAddressId?: mongoose.Types.ObjectId) => {

    // Define todos os outros endereços (exceto o atual, se fornecido) como não-padrão
    const filter: any = { userId }
    if (currentAddressId) {

        filter._id = { $ne: currentAddressId }
    }

    await Address.updateMany(filter, { isDefault: false })
}

// =========================================================================
// POST /api/addresses - Criar novo endereço
// =========================================================================
export const createAddress = async (req: Request, res: Response) => {

    try {

        const userId = req.user?.userId
        if (!userId) {

            return res.status(401).json({ error: "Usuário não autenticado." })
        }

        const { street, city, state, zipCode, country, isDefault } = req.body

        if (!street || !city || !state || !zipCode) {

            return res.status(400).json({ error: "Campos obrigatórios ausentes." })
        }

        const addressData = {
            userId,
            street,
            city,
            state,
            zipCode,
            country,
            isDefault: isDefault === true,
        }

        if (addressData.isDefault) {

            await ensureOnlyOneDefault(new mongoose.Types.ObjectId(userId))
        }

        const newAddress = new Address(addressData)
        await newAddress.save()
        
        res.status(201).json({ message: "Endereço criado com sucesso", address: newAddress })
    }

    catch (error) {

        console.error("Erro ao criar endereço:", error)
        res.status(500).json({ error: "Erro interno ao criar endereço." })
    }
}

// =========================================================================
// GET /api/addresses - Listar todos os endereços do usuário
// =========================================================================
export const getAddresses = async (req: Request, res: Response) => {

    try {

        const userId = req.user?.userId
        if (!userId) {

            return res.status(401).json({ error: "Usuário não autenticado." })
        }

        const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: 1 })
        
        res.json(addresses)
    }

    catch (error) {

        console.error("Erro ao buscar endereços:", error)
        res.status(500).json({ error: "Erro interno ao buscar endereços." })
    }
}

// =========================================================================
// PUT /api/addresses/:id - Atualizar endereço
// =========================================================================
export const updateAddress = async (req: Request, res: Response) => {

    try {

        const userId = req.user?.userId
        if (!userId) return res.status(401).json({ error: "Usuário não autenticado." })

        const { id } = req.params
        const updateData = req.body
        
        // Garante que o usuário só pode atualizar seus próprios endereços
        const objectId = new mongoose.Types.ObjectId(id)
        const objectUserId = new mongoose.Types.ObjectId(userId)

        const address = await Address.findOne({ _id: objectId, userId: objectUserId })
        if (!address) {

            return res.status(404).json({ error: "Endereço não encontrado ou não pertence ao usuário." })
        }

        if (updateData.isDefault === true) {

            await ensureOnlyOneDefault(new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(id))
        }

        const updatedAddress = await Address.findByIdAndUpdate(id, updateData, { new: true })
        
        res.json({ message: "Endereço atualizado com sucesso", address: updatedAddress })
    }

    catch (error) {

        console.error("Erro ao atualizar endereço:", error)
        res.status(500).json({ error: "Erro interno ao atualizar endereço." })
    }
}

// =========================================================================
// DELETE /api/addresses/:id - Deletar endereço
// =========================================================================
export const deleteAddress = async (req: Request, res: Response) => {

    try {

        const userId = req.user?.userId
        if (!userId) {

            return res.status(401).json({ error: "Usuário não autenticado." })
        }

        const { id } = req.params

        const objectId = new mongoose.Types.ObjectId(id)
        const objectUserId = new mongoose.Types.ObjectId(userId)
        
        // Garante que o usuário só pode deletar seus próprios endereços
        const deletedAddress = await Address.findOneAndDelete({ _id: objectId, userId: objectUserId })
        
        if (!deletedAddress) {

            return res.status(404).json({ error: "Endereço não encontrado ou não pertence ao usuário." })
        }
        
        res.json({ message: "Endereço removido com sucesso" })
    }

    catch (error) {

        console.error("Erro ao deletar endereço:", error)
        res.status(500).json({ error: "Erro interno ao deletar endereço." })
    }
}