import express from "express";

import {
	getServiceStatisticsController,
	updateServiceController,
} from "../controllers/servicesControllers/index.js";

const router = express.Router();

// Endpoint detalle de un producto/servicio
router.get("/service/statistics", getServiceStatisticsController);

// Enpoint actualización servicio/producto
router.put("/service/update/:id", updateServiceController);

export default router;
