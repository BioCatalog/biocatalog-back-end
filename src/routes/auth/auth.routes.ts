import { Router } from "express";
import AuthController from "../../controller/auth";
import authMiddleware from "../../middleware/auth.middleware";

const authRoutes = Router();

authRoutes.post('/registrar', AuthController.register);
authRoutes.post('/login', AuthController.login);
authRoutes.post('/logout', AuthController.logout);
authRoutes.post('/changePass', authMiddleware, AuthController.changePass);
authRoutes.put('/updateUser', authMiddleware, AuthController.updateUser);

export default authRoutes;