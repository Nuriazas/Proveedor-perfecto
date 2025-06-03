// router/contactRouter.js
import express from "express";
import contactProvider from "../controllers/servicesControllers/contactProvider"; 

const router = express.Router();

router.post("/contact/provider", contactProvider);

export default router;
