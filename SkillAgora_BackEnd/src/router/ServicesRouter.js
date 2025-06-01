import express from 'express';
import { getCategoriesController, getFeaturedServicesController, uploadServicePhotoController } from '../controllers/servicesControllers/index.js';

// Creando un router para manejar las rutas relacionadas con los servicios
const ServicesRouter = express.Router();

// Ruta para subir una foto de un servicio
ServicesRouter.post('/services/upload', uploadServicePhotoController);

// GET /api/services/categories
ServicesRouter.get('/services/categories', getCategoriesController);

// GET /api/services/featured?limit=6
ServicesRouter.get('/services/featured', getFeaturedServicesController);

export default ServicesRouter;