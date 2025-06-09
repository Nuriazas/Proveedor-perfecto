import express from "express";
import {
    registerUserController,
    validateUserController,
    loginUserController,
    uploadProfilePhotoController,
    getAllFreelancersController,
    getFreelancerByIdController,
    requestFreelancerStatusController,
    changePasswordUser,
    getProfile,
    updateUserController,
} from "../controllers/usersControllers/index.js";
import registerUserValidator from "../validators/registerUserValidator.js";
import loginUserValidator from "../validators/loginUserValidator.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import validateUpdateUser from "../validators/updateUserValidator.js";
import validateRegistrationCode from "../validators/validateRegistrationCode.js";

import validateUpdateUser from "../validators/updateUserValidator.js"

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/users/register", registerUserValidator, registerUserController);
router.get(
    "/users/validate/:registrationCode",
    validateRegistrationCode,
    validateUserController
);

// Ruta para iniciar sesión de usuario
router.post("/users/login", loginUserValidator, loginUserController);

// Ruta para subir la foto de perfil del usuario
router.post("/users/upload", uploadProfilePhotoController);

// Obtener todos los freelancers
router.get("/users/freelancers", getAllFreelancersController);

// Obtener un freelancer por ID
router.get("/users/freelancers/:id", getFreelancerByIdController);

//Ruta para el cambio de contraseña
router.post("/change-password", authMiddleware, changePasswordUser);

//Ruta para la información del usuario
router.get("/users/profile/:name", authMiddleware, getProfile);

// Endpoint para solicitar estatus de freelancer
router.post(
    "/users/request-freelancer-status/:userId",
    authMiddleware,
    requestFreelancerStatusController
);

router.put("/users/update/:id", authMiddleware, validateUpdateUser, updateUserController);

export default router;