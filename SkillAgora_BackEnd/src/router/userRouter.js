import express from 'express';

import  
{registerUserController, 
    loginUserController,
    validateUserController,
    getProfile,
    changePasswordUser
}  from '../controllers/users/index.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Creando un router para manejar las rutas relacionadas con los usuarios
const router = express.Router();


// Ruta para registrar un nuevo usuario
router.post('/users/register', registerUserController );
router.get('/users/validate/:registrationCode', validateUserController);



// Ruta para iniciar sesión de usuario
router.post('/users/login', loginUserController);

//Ruta para la información del usuario
router.get("/profile", authMiddleware, getProfile);

//Ruta para el cambio de contraseña
router.post('/change-password', authMiddleware, changePasswordUser);


export default router;