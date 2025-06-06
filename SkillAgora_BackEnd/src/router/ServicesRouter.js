import express from "express";
import {
	getCategoriesController,
	getFeaturedServicesController,
	uploadServicePhotoController,
	getServiceStatisticsController,
	updateServiceController,
	getServiceDetailsByIdController,
	getAllServicesController,
	createServiceController,
	getAllServicesByFiltersController
} from "../controllers/servicesControllers/index.js";
import authMiddleware from "../middleware/authMiddleware.js";

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



// Endpoint detalle de un producto/servicio
servicesRouter.get("/service/statistics", getServiceStatisticsController);

// Enpoint actualización servicio/producto
servicesRouter.put("/service/update/", authMiddleware, updateServiceController);

servicesRouter.get("/service/:id", getServiceDetailsByIdController);

servicesRouter.post("/create-service", authMiddleware,createServiceController); 
// Endpoint filtros y ordenaciones de servicios
servicesRouter.get("/services/filters", getAllServicesByFiltersController);



export default servicesRouter;
