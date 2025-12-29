import { User } from "../../src/infra/models/User"
import { Product } from "../../src/infra/models/Product"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"

export const createTestUser = async (role: "user" | "admin" = "user", suffix: string = Date.now().toString()): Promise<{ user: IUser, token: string }> => {

    const passwordHash = await bcrypt.hash("123456", 10)
    const baseEmail = role === "admin" ? "hildebrando@admin.com" : "hildebrando@example.com"
    let email: string
    if (role === "admin") {
        email = `admin-${suffix}@example.com`
    } else {
        email = `user-${suffix}@example.com`
    }

    const user = await User.create({
        name: "Hildebrando",
        email,
        passwordHash,
        role,
    })

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        },
        process.env.JWT_SECRET || "supersecret",
        { expiresIn: "1h" }
    )

    return { user, token }
}

export const createTestProduct = async (productData = {}) => {
    return await Product.create({
        name: "Produto Teste",
        description: "Descrição do produto teste",
        price: 99.99,
        stock: 10,
        ...productData,
    })
}