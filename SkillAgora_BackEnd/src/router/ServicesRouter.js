import express from 'express';
import getContactRequestNotificationsController from "../controllers/services/getContactRequestNotificationsController.js";
import getServiceStatisticsController from "../controllers/services/getServiceStatisticsController.js"


const router = express.Router();
// Importando el controlador para traer las notificaciones de solicitudes de contacto
router.get("/notifications", getContactRequestNotificationsController);

// Importando el controlador para traer las estadísticas del servicio
router.get("/statistics", getServiceStatisticsController);

export default router;
