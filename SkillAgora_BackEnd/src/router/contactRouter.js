import express from "express";
import { sendContactRequestController } from "../controllers/contactControllers/index.js";
import authMiddleware from "../middleware/authMiddleware.js";
import contactProvider from "../controllers/servicesControllers/contactProvider.js";

const router = express.Router();

// Endpoint para enviar solicitud de contacto a proveedor
router.post("/contact/request", authMiddleware, sendContactRequestController);

router.post("/contact/provider", contactProvider);

export default router; 