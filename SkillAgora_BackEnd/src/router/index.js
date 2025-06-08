import express from "express";
import userRouter from "./userRouter.js";
import servicesRouter from "./ServicesRouter.js";
import ordersRouter from "./ordersRouter.js";
import contactRouter from "./contactRouter.js";
import adminRouter from "./adminRouter.js";

// Creando un router principal que combine todos los routers de la aplicación

// Este router se encargará de manejar las rutas de la aplicación
const router = express.Router();

// Rutas de usuarios
router.use(userRouter);

// Rutas de servicios
router.use(servicesRouter);

// Rutas de reseñas
router.use(ordersRouter);

// Rutas de contacto
router.use(contactRouter);

// Rutas de administración
router.use(adminRouter);

export default router;
