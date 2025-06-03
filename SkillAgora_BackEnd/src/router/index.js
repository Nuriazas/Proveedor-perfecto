import express from "express";
import userRouter from "./userRouter.js";
import servicesRouter from "./servicesRouter.js";
import adminRouter from "./adminRouter.js";
import notificationsRouter from "./notificationsRouter.js";
import reviewsRouter from "./reviewsRouter.js";
import contactRouter from "./contactRouter.js";

// Creando un router principal que combine todos los routers de la aplicación

// Este router se encargará de manejar las rutas de la aplicación
const router = express.Router();

router.use(userRouter);
router.use(servicesRouter);
router.use(adminRouter);
router.use(notificationsRouter);
router.use(reviewsRouter);
router.use(contactRouter);

export default router;
