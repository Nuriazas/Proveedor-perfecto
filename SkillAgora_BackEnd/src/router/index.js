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
router.use( notificationsRouter);

// Rutas de usuarios
router.use( userRouter);

// Rutas de servicios
router.use( servicesRouter);

// Rutas de reseñas
router.use( reviewsRouter);

// Rutas de contacto
router.use( contactRouter);

// Rutas de administración
router.use(adminRouter);

export default router;
