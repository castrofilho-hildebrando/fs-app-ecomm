import { Router } from "express"
import { authenticate } from "../middlewares/authMiddleware"
import { isAdmin } from "../middlewares/isAdmin"
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from "../controllers/userController"

const router = Router()

// Todas as rotas de manipulação de usuários exigem Admin neste design
router.get("/", authenticate, isAdmin, getAllUsers)
router.get("/:id", authenticate, isAdmin, getUserById)
router.put("/:id", authenticate, isAdmin, updateUser)
router.delete("/:id", authenticate, isAdmin, deleteUser)

export default router
