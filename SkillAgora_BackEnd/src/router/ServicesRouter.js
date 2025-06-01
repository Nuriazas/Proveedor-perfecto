import express from "express";
import getContactRequestNotificationsController from "../controllers/services/getContactRequestNotificationsController.js";
import getServiceStatisticsController from "../controllers/services/getServiceStatisticsController.js";
import updateServiceController from "../controllers/services/updateServiceController.js";

const router = express.Router();
// Endpoint lista solicitudes de contacto
router.get("/notifications/contacts", getContactRequestNotificationsController);

// Endpoint detalle de un producto/servicio
router.get("/service/statistics", getServiceStatisticsController);

// Enpoint actualización servicio/producto
router.put("/service/update", updateServiceController);

export default router;
