import ordersController from "../controllers/ordersControllers/ordersController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

// Rutas de órdenes

// Crear una orden
// localhost:3000/orders/create/:serviceId
// BODY: { services_id: Array, total_price: Number, currency_code: String, ... }
router.post("/orders/:action/:serviceId", authMiddleware, ordersController);

// Obtener todas las órdenes (query: status, page, limit) o una orden específica
// localhost:3000/orders/get
router.get("/orders/:action", authMiddleware, ordersController);

// Obtener orden por ID
// localhost:3000/orders/getById/:orderId
router.get("/orders/:action/:orderId", authMiddleware, ordersController);

// Actualizar orden
// localhost:3000/orders/update/:orderId
// BODY: { status?: String, services_id?: Array, total_price?: Number, currency_code?: String, ... }
/*
// Ejemplo de BODY para actualizar una orden
    {
    "services_id": [1, 2],
    "total_price": 150,
    "currency_code": "USD",
    "status": "processing"
    }
*/
router.put("/orders/:action/:orderId", authMiddleware, ordersController);

// Eliminar orden
// localhost:3000/orders/delete/:orderId
router.delete("/orders/:action/:orderId", authMiddleware, ordersController);

// Aceptar orden
// localhost:3000/orders/accept/:orderId
router.put("/orders/:action/:orderId", authMiddleware, ordersController);

// Entregar orden
// localhost:3000/orders/delivered/:orderId
// BODY: { deliveryUrl: String }
router.post("/orders/:action/:orderId", authMiddleware, ordersController);

export default router;
