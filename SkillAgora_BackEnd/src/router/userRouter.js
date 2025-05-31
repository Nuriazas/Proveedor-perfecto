import express from "express";
import {
  registerUserController,
  loginUserController,
  validateUserController,
  getAllFreelancersController,
  getFreelancerByIdController
} from "../controllers/users/index.js";

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/users/register", registerUserController);
router.get("/users/validate/:registrationCode", validateUserController);

// Ruta para iniciar sesión de usuario
router.post("/users/login", loginUserController);

// Obtener todos los freelancers
router.get("/users/freelancers", getAllFreelancersController);

// Obtener un freelancer por ID
router.get("/users/freelancers/:id", getFreelancerByIdController);

export default router;