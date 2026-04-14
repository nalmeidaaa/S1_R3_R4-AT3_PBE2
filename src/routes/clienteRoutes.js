import { Router } from "express";
import clienteController from "../controllers/clienteController.js";

const router = Router();

router.post("/", clienteController.criar);
router.get("/", clienteController.selecionar);
router.put("/:id", clienteController.atualizar);
router.delete("/:id", clienteController.deletar);

export default router;