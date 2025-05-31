import express from 'express';
import getFreelancerByIdController from '../controllers/users/getFreelancerByIdController.js';

import {getCategoriesController, getFeaturedServicesController} from "../controllers/servicesControllers/index.js";
import getAllFreelancersController from '../controllers/users/getAllFreelancersController.js';

const ServicesRouter = express.Router();

// GET /api/services/categories
ServicesRouter.get('/services/categories', getCategoriesController);

// GET /api/services/featured?limit=6
ServicesRouter.get('/services/featured', getFeaturedServicesController);
ServicesRouter.get('/allfreelancers', getAllFreelancersController);
ServicesRouter.get('/freelancerbyid/:id', getFreelancerByIdController);
export default ServicesRouter;