import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserMongoRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

const userRepository = new UserMongoRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);

export default router;
