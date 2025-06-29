import express from "express";
import {
	getCategoriesController,
	getFeaturedServicesController,
	uploadServicePhotoController,
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




// Enpoint actualización servicio/producto
servicesRouter.put("/service/:action/:id", authMiddleware, updateServiceController);

servicesRouter.get("/service/:id", getServiceDetailsByIdController);

servicesRouter.post("/create-service", authMiddleware,createServiceController); 
// Endpoint filtros y ordenaciones de servicios
servicesRouter.get("/services/filters", getAllServicesByFiltersController);

// Crear una nueva valoración (requiere autenticación)
servicesRouter.post("/services/newreview/:service_id", authMiddleware, createReviewController);

// Obtener valoraciones de un freelancer
servicesRouter.get("/freelancer/:freelancer_id", getFreelancerReviewsController);



export default servicesRouter;
