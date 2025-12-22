// FILE: ./src/controllers/authController.ts

import { Request, Response } from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { User } from "../models/User"

// Importante: O '!' garante ao TypeScript que esta variável é uma string definida,
// já que carregamos o .env no server.ts.
const JWT_SECRET = (process.env.JWT_SECRET || "supersecret") as string 

// =========================================================================
// REGISTER
// =========================================================================
export const registerUser = async (req: Request, res: Response) => {

    try {

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Nome, email e senha são obrigatórios" })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ error: "E-mail já registrado" })
        }

        // Hashing da senha
        const passwordHash = await bcrypt.hash(password, 10) 

        // Criação e salvamento do usuário (role 'user' como padrão)
        const newUser = new User({
            name,
            email,
            passwordHash, 
            role: "user",
        })
        await newUser.save()

        // Geração do token
        const token = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: "1d" },
        )

        // Retorna 201 Created com o token
        // O campo passwordHash é omitido automaticamente pelo modelo (deve ser, pelo menos)
        res.status(201).json({
            token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        })
    } catch (error) {
        console.error("Erro no registro de usuário:", error)
        res.status(500).json({ error: "Erro interno ao registrar usuário." })
    }
}

// =========================================================================
// LOGIN
// =========================================================================
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        
        // 1. Busca o usuário, OBRIGANDO a retornar o passwordHash
        // Se o campo de senha no modelo estiver com `select: false`, esta linha o recupera.
        const user = await User.findOne({ email }).select("+passwordHash")

        if (!user) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        // 2. Compara a senha (user.passwordHash agora é garantido)
        // Se user.passwordHash for null/undefined, bcrypt.compare lança exceção (o que causava o 500)
        const isMatch = await bcrypt.compare(password, user.passwordHash || "") // Usamos "" como fallback seguro

        if (!isMatch) {
            return res.status(401).json({ error: "Credenciais inválidas" })
        }

        // 3. Geração do token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" },
        )

        res.json({ token, role: user.role })
    } catch (error) {
        console.error("Erro no login (Possível falha no bcrypt ou JWT):", error)
        res.status(500).json({ error: "Erro interno do servidor." })
    }
}