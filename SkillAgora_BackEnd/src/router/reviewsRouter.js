import express from "express";
import {
    createReviewController,
    getFreelancerReviewsController
} from "../controllers/reviewsControllers/index.js";
import authMiddleware from "../middleware/authMiddleware.js";

const reviewsRouter = express.Router();

// Crear una nueva valoración (requiere autenticación)
reviewsRouter.post("/newreview", authMiddleware, createReviewController);

// Obtener valoraciones de un freelancer
reviewsRouter.get("/freelancer/:freelancer_id", getFreelancerReviewsController);

export default reviewsRouter; 