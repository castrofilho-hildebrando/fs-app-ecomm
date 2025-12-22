import { Request, Response } from "express"
import { User } from "../models/User"

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-passwordHash")
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar usuários" })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.params.id).select("-passwordHash")
        if (!user)
            return res.status(404).json({ error: "Usuário não encontrado" })

        res.json(user)
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuário" })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        ).select("-passwordHash")
        if (!updatedUser)
            return res.status(404).json({ error: "Usuário não encontrado" })

        res.json({
            message: "Usuário atualizado com sucesso!",
            user: updatedUser,
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar usuário" })
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        if (!deletedUser)
            return res.status(404).json({ error: "Usuário não encontrado" })

        res.json({ message: "Usuário removido com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: "Erro ao remover usuário" })
    }
}
