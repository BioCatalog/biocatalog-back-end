import { Router } from 'express';
import UserController from "../../controller/user";

const userRoutes = Router();

userRoutes.get('/', UserController.getAll);
userRoutes.get('/:id', UserController.getById);

export default userRoutes;
