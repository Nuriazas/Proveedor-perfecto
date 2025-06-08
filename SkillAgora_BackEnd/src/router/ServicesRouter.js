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
	getAllServicesByFiltersController,
	createReviewController,
	getFreelancerReviewsController
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
servicesRouter.put("/service/:action/:serviceId", authMiddleware, updateServiceController);

servicesRouter.get("/service/:id", getServiceDetailsByIdController);

servicesRouter.post("/create-service", authMiddleware,createServiceController); 
// Endpoint filtros y ordenaciones de servicios
servicesRouter.get("/services/filters", getAllServicesByFiltersController);

// Crear una nueva valoración (requiere autenticación)
servicesRouter.post("/newreview", authMiddleware, createReviewController);

// Obtener valoraciones de un freelancer
servicesRouter.get("/freelancer/:freelancer_id", getFreelancerReviewsController);



export default servicesRouter;
