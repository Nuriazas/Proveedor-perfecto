import express from "express";
import {
	getCategoriesController,
	getFeaturedServicesController,
	uploadServicePhotoController,
	getServiceStatisticsController,
	updateServiceController,
	getServiceDetailsByIdController,
	getAllServicesController
} from "../controllers/servicesControllers/index.js";

// Creando un router para manejar las rutas relacionadas con los servicios
const servicesRouter = express.Router();
// Ruta para obtener todos los servicios
servicesRouter.get("/services", getAllServicesController)

// Ruta para subir una foto de un servicio
servicesRouter.post("/services/upload", uploadServicePhotoController);

// GET /api/services/categories
servicesRouter.get("/services/categories", getCategoriesController);

// GET /api/services/featured?limit=6
servicesRouter.get("/services/featured", getFeaturedServicesController);

const router = express.Router();

// Endpoint detalle de un producto/servicio
servicesRouter.get("/service/statistics", getServiceStatisticsController);

// Enpoint actualización servicio/producto
servicesRouter.put("/service/update/:id", updateServiceController);

servicesRouter.get("/service/:id", getServiceDetailsByIdController);



export default servicesRouter;
