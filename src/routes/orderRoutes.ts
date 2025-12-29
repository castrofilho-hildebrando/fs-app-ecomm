import { Router } from "express"
import { checkout, getMyOrders, updateOrderStatus, getAllOrders, createOrder } from "../controllers/orderController"
import { authenticate } from "../middlewares/authMiddleware"

const router = Router()

router.post("/checkout", authenticate, checkout)
router.post("/", authenticate, createOrder)
router.get("/my", authenticate, getMyOrders)

router.get("/", authenticate, getAllOrders)
router.put("/:id", authenticate, updateOrderStatus)

export default router