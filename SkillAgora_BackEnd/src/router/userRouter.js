import express from 'express';
import authenticateUser from "../middleware/authMiddleware.js";

import  
{registerUserController, 
    loginUserController,
    validateUserController,
    getProfile
}  from '../controllers/users/index.js';

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();


// Ruta para registrar un nuevo usuario
router.post('/users/register', registerUserController );
router.get('/users/validate/:registrationCode', validateUserController);



// Ruta para iniciar sesión de usuario
router.post('/users/login', loginUserController);

//Ruta para la información del usuario
router.get("/profile", authenticateUser, getProfile);



export default router;