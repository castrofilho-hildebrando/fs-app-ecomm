import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes"
import cartRoutes from "./routes/cartRoutes"
import productRoutes from "./routes/productRoutes"
import adminRoutes from "./routes/adminRoutes"
import userRoutes from "./routes/userRoutes"
import orderRoutes from "./routes/orderRoutes"
import addressRoutes from "./routes/addressRoutes"

const app = express()
 
// Middlewares
app.use(cors())
app.use(express.json())

app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/addresses", addressRoutes)

export default app
