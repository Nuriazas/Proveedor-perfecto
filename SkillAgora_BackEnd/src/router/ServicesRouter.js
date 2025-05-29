import express from 'express';

import {getCategoriesController, getFeaturedServicesController} from "../controllers/servicesControllers/index.js";

const ServicesRouter = express.Router();

// GET /api/services/categories
ServicesRouter.get('/categories', getCategoriesController);

// GET /api/services/featured?limit=6
ServicesRouter.get('/featured', getFeaturedServicesController);

export default ServicesRouter;