// FILE: src/routes/productRoutes.ts

import { Router } from "express"
import { authenticate } from "../middlewares/authMiddleware" 
import { adminAuth } from "../middlewares/adminAuth" 
import { 
    createProduct, 
    getAllProducts, 
    updateProduct, 
    deleteProduct 
} from "../controllers/productController" // Importa a lógica do controller

const router = Router()

// GET /api/products - Rota pública para listar todos os produtos
router.get("/", getAllProducts)

// Rotas protegidas (apenas Admin)
// POST /api/products - Criar produto
router.post("/", authenticate, adminAuth, createProduct)

// PUT /api/products/:id - Atualizar produto
router.put("/:id", authenticate, adminAuth, updateProduct)

// DELETE /api/products/:id - Deletar produto
router.delete("/:id", authenticate, adminAuth, deleteProduct)

export default router