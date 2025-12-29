import { Router } from "express"
import { getCart, addItemToCart, removeItemFromCart, clearCart } from "../controllers/cartController"
import { authenticate } from "../middlewares/authMiddleware" // Corrigido para plural

const router = Router()

router.get("/", authenticate, getCart)
router.post("/add", authenticate, addItemToCart)
router.post("/remove", authenticate, removeItemFromCart) // Corrigido nome da função
router.post("/clear", authenticate, clearCart)

export default router