// FILE: src/middlewares/adminAuth.ts

import { Request, Response, NextFunction } from "express"

export const adminAuth = (req: Request, res: Response, next: NextFunction)=> {
    // 1. Verifica se o usuário foi autenticado
    if (!req.user || !req.user.role) {
        return res.status(401).json({ error: "Acesso negado. Token inválido ou ausente." })
    }
    
    // 2. Verifica se o papel (role) é 'admin'
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Acesso negado. Requer permissão de Administrador." })
    }

    next()
}