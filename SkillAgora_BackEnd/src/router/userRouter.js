import express from "express";
import {
	registerUserController,
	loginUserController,
	validateUserController,
	requestFreelancerStatusController,
} from "../controllers/users/index.js";
import getContactRequestNotificationsController from "../controllers/notifications/getContactRequestNotificationsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/users/register", registerUserController);
router.get("/users/validate/:registrationCode", validateUserController);

// Ruta para iniciar sesión de usuario
router.post("/users/login", loginUserController);

// Endpoint lista solicitudes de contacto
router.get("/notifications/contacts", getContactRequestNotificationsController);

// Endpoint para solicitar estatus de freelancer
router.post(
	"/users/request-freelancer-status/:userId",
	authMiddleware,
	requestFreelancerStatusController
);

export default router;
