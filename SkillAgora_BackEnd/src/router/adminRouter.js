import express from 'express';
import acceptFreelancerRegisterController from '../controllers/adminsControllers/acceptFreelancerRequestController.js'
import authMiddleware from '../middleware/authMiddleware.js';

// Creando un router para manejar las rutas relacionadas con admin
const router = express.Router();

// Endpoint para aceptar el registro de un proveedor (administrador)
router.post(
	"/admin/accept-freelancer-request/:id", authMiddleware,
	acceptFreelancerRegisterController
);

export default router;