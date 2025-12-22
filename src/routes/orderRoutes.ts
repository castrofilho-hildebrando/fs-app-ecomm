import { Router } from "express"
import { authenticate } from "../middlewares/authMiddleware"
import { isAdmin } from "../middlewares/isAdmin"
import {
    checkout,
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/orderController"

const router = Router()

router.post("/checkout", authenticate, checkout)
router.post("/", authenticate, createOrder)
router.get("/my", authenticate, getMyOrders)

// Rotas Admin
router.get("/", authenticate, isAdmin, getAllOrders)
router.put("/:id", authenticate, isAdmin, updateOrderStatus)

export default router
