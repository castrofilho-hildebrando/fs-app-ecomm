import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"

const JWT_SECRET = (process.env.JWT_SECRET || "supersecret") as string

interface TokenPayload extends JwtPayload {
    userId: string;
    role: string;
}

export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {

    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ message: "Token missing" })
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2) {
        return res.status(401).json({ message: "Token malformed" })
    }

    const tokenCandidate = parts[1]
    if (!tokenCandidate) {
        return res.status(401).json({ message: "Token missing" })
    }

    const token: string = tokenCandidate
    let decoded: JwtPayload

    try {

        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload
    } catch {
        return res.status(401).json({ message: "Invalid token" })
    }

    if (
        typeof decoded !== "object" ||
        typeof decoded.id !== "string" ||
        (decoded.role !== "user" && decoded.role !== "admin")
    ) {
        return res.status(401).json({ message: "Invalid token payload" })
    }

    req.user = {
        id: decoded.id,
        role: decoded.role
    }

    next()
}

