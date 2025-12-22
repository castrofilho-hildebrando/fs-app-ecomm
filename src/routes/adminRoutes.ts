import { Router } from "express"
import { authenticate } from "../middlewares/authMiddleware"
import { isAdmin } from "../middlewares/isAdmin"
import { getStats } from "../controllers/adminController"

const router = Router()

router.get("/stats", authenticate, isAdmin, getStats)

export default router
