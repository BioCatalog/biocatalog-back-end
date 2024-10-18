import { Router } from 'express'
import UserController from "../../controller/user";

const userRoutes = Router();

userRoutes.get('/', UserController.getAll)

export default userRoutes;
