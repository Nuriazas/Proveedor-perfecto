import express from 'express';
import { uploadServicePhotoController } from '../controllers/servicesControllers/index.js';

// Creando un router para manejar las rutas relacionadas con los servicios
const ServicesRouter = express.Router();

// Ruta para subir una foto de un servicio
ServicesRouter.post('/services/upload', uploadServicePhotoController);

export default ServicesRouter;