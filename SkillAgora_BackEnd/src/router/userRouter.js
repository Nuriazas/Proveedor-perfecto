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
  getCurrentUserProfileController,
  updateUserController,
  sendForgotPassCodeController,
  logoutUserController,
} from "../controllers/usersControllers/index.js";

import registerUserValidator from "../validators/registerUserValidator.js";
import loginUserValidator from "../validators/loginUserValidator.js";
import authMiddleware from "../middleware/authMiddleware.js";
import validateRegistrationCode from "../validators/validateRegistrationCode.js";
import validateUpdateUser from "../validators/updateUserValidator.js";

const router = express.Router();

// Recuperar contraseña
router.post("/users/forgot-password", sendForgotPassCodeController);

// Registro y validación
router.post("/users/register", registerUserValidator, registerUserController);
router.get("/users/validate/:registrationCode", validateRegistrationCode, validateUserController);

// Login
router.post("/users/login", loginUserValidator, loginUserController);

// Logout
router.post("/users/logout", logoutUserController);

// Subida de foto
router.post("/users/upload", uploadProfilePhotoController);

// Freelancers
router.get("/users/freelancers", getAllFreelancersController);
router.get("/users/freelancers/:id", getFreelancerByIdController);
router.post("/users/request-freelancer-status/:userId", authMiddleware, requestFreelancerStatusController);

// Perfil
router.get("/users/profile", authMiddleware, getCurrentUserProfileController);
router.get("/users/profile/:name", authMiddleware, getProfile);

//  Cambio de contraseña
router.post("/change-password", authMiddleware, changePasswordUser);

//  Actualizar usuario
router.put("/users/update/:id", authMiddleware, validateUpdateUser, updateUserController);

export default router;
