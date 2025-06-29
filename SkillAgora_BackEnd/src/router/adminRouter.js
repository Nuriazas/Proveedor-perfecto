import express from 'express';
import acceptFreelancerRequestController from '../controllers/adminsControllers/acceptFreelancerRequestController.js';
import rejectFreelancerRequestController from '../controllers/adminsControllers/rejectFreelancerRequestController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import getAdminStatisticsController from "../controllers/adminsControllers/getAdminStatisticsController.js"

// Creando un router para manejar las rutas relacionadas con admin
const router = express.Router();

// Endpoint para aceptar solicitud de freelancer
router.post(
	"/admin/accept-freelancer-request/:notificationId", 
	authMiddleware, 
	adminMiddleware,
	acceptFreelancerRequestController
);

// Endpoint para rechazar solicitud de freelancer
router.post(
	"/admin/reject-freelancer-request/:notificationId", 
	authMiddleware, 
	adminMiddleware,
	rejectFreelancerRequestController
);

router.get("/admin/statistics", authMiddleware, adminMiddleware, getAdminStatisticsController);

export default router;