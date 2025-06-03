import express from "express";
import { sendContactRequestController } from "../controllers/contactControllers/index.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Endpoint para enviar solicitud de contacto a proveedor
router.post("/contact/request", authMiddleware, sendContactRequestController);

export default router; 