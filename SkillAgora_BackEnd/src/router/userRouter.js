import express from "express";
import {
	registerUserController,
	validateUserController,
	loginUserController,
	uploadProfilePhotoController,
	getAllFreelancersController,
	getFreelancerByIdController,
	requestFreelancerStatusController,
} from "../controllers/usersControllers/index.js";


import authMiddleware from "../middleware/authMiddleware.js";

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/users/register", registerUserController);
router.get("/users/validate/:registrationCode", validateUserController);

// Ruta para iniciar sesión de usuario
router.post("/users/login", loginUserController);

// Ruta para subir la foto de perfil del usuario
router.post("/users/upload", uploadProfilePhotoController);

// Obtener todos los freelancers
router.get("/users/freelancers", getAllFreelancersController);

// Obtener un freelancer por ID
router.get("/users/freelancers/:id", getFreelancerByIdController);



// Endpoint para solicitar estatus de freelancer
router.post(
	"/users/request-freelancer-status/:userId",
	authMiddleware,
	requestFreelancerStatusController
);

export default router;
