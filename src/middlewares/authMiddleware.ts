import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

type AuthTokenPayload = {
    userId: string
    role: "user" | "admin"
}

function isAuthTokenPayload(payload: any): payload is AuthTokenPayload {
    return (
        payload &&
        typeof payload === "object" &&
        typeof payload.userId === "string" &&
        (payload.role === "user" || payload.role === "admin")
    )
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: "Token não fornecido" })
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Formato de token inválido" })
    }

    const token = parts[1]
    if (!token) {
        return res.status(401).json({ error: "Token inválido" })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET is not defined")
    }

    try {
        const decoded = jwt.verify(token, secret)

        if (!isAuthTokenPayload(decoded)) {
            return res.status(401).json({ error: "Token inválido" })
        }

        req.user = {
            userId: decoded.userId,
            role: decoded.role,
        }

        next()
    } catch {
        return res.status(401).json({ error: "Token inválido" })
    }
}
