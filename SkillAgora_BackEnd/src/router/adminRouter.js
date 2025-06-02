import express from 'express';
import acceptFreelancerRegisterController from '../controllers/adminsControllers/acceptFreelancerRequestController.js'

// Creando un router para manejar las rutas relacionadas con admin
const router = express.Router();

// Endpoint para aceptar el registro de un proveedor (administrador)
router.post(
	"/admin/accept-freelancer-request/:id",
	acceptFreelancerRegisterController
);

export default router;