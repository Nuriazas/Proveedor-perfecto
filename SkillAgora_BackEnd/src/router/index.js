import express from "express";
import notificationsRouter from "./notificationsRouter.js";
import userRouter from "./userRouter.js";
import servicesRouter from "./ServicesRouter.js";
import reviewsRouter from "./reviewsRouter.js";
import contactRouter from "./contactRouter.js";
import adminRouter from "./adminRouter.js";

// Creando un router principal que combine todos los routers de la aplicación

// Este router se encargará de manejar las rutas de la aplicación
const router = express.Router();

// Rutas de notificaciones
router.use("/notifications", notificationsRouter);

// Rutas de usuarios
router.use("/users", userRouter);

// Rutas de servicios
router.use("/services", servicesRouter);

// Rutas de reseñas
router.use("/reviews", reviewsRouter);

// Rutas de contacto
router.use("/contact", contactRouter);

// Rutas de administración
router.use("/admin", adminRouter);

export default router;
