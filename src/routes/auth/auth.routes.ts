import { Router } from "express";
import AuthController from "../../controller/auth";

const authRoutes = Router();

authRoutes.post('/registrar', AuthController.register);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', AuthController.logout);

export default authRoutes;