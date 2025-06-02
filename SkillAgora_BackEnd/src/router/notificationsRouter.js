import { getContactRequestNotificationsController } from "../controllers/notificationsControllers/index.js";
import express from "express";

const router = express.Router();

// Endpoint lista solicitudes de contacto
router.get("/notifications/contacts", getContactRequestNotificationsController);

export default router;
