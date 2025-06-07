import express from "express";
import { 
    orderNotificationsController,
    sendContactRequestController,
    acceptContactRequestController 
} from "../controllers/notificationsControllers/index.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Rutas de órdenes
router.post("/orders/:action", authMiddleware, orderNotificationsController);
router.get("/orders/:action", authMiddleware, orderNotificationsController);
router.get("/orders/:action/:orderId", authMiddleware, orderNotificationsController);
router.put("/orders/:action/:orderId", authMiddleware, orderNotificationsController);
router.delete("/orders/:action/:orderId", authMiddleware, orderNotificationsController);

//ruta para aceptar orden
router.put("/orders/:action/:orderId", authMiddleware, orderNotificationsController);

//ruta para entrega de pedido
router.post("/orders/delivered/:orderId",authMiddleware, orderNotificationsController);

// Rutas para solicitudes de contacto
router.post("/contact-request", authMiddleware, sendContactRequestController);
router.put("/contact-request/:requestId/accept", authMiddleware, acceptContactRequestController);

export default router; 