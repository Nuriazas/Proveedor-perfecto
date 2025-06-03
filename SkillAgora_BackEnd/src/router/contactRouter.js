import express from "express";
import {
  getContactRequestNotificationsController,
  sendContactRequestController,
  acceptContactRequestController,
} from "../controllers/contactsControllers/index.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Endpoint lista solicitudes de contacto
router.get("/notifications/contacts", getContactRequestNotificationsController);

// Endpoint para enviar solicitud de contacto a proveedor
router.post("/contact/request", authMiddleware, sendContactRequestController);
// Endpoint para aceptar una solicitud de contacto
router.post(
  "/contact-request/:notificationId/accept",
  authMiddleware,
  acceptContactRequestController
);

export default router;
