import express from 'express';

import userRouter from './userRouter.js'; 
// Creando un router principal que combine todos los routers de la aplicación

// Este router se encargará de manejar las rutas de la aplicación
const router = express.Router();

router.use(userRouter);


export default router;