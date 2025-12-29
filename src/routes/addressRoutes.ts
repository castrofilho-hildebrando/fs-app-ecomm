import { Router } from "express"
import { authenticate } from "../middlewares/authMiddleware" 
import { 
    createAddress, 
    getAddresses, 
    updateAddress, 
    deleteAddress 
} from "../controllers/addressController"

const router = Router()

// Todas as rotas de endereço são protegidas por autenticação
router.use(authenticate)

// POST /api/addresses - Criar endereço
router.post("/", createAddress)

// GET /api/addresses - Listar endereços
router.get("/", getAddresses)

// PUT /api/addresses/:id - Atualizar endereço
router.put("/:id", updateAddress)

// DELETE /api/addresses/:id - Deletar endereço
router.delete("/:id", deleteAddress)

export default router