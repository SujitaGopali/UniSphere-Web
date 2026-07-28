import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { UserMongoRepository } from "../repositories/user.repository";
import { LoginHistoryMongoRepository } from "../repositories/login-history.repository";
import { UserService } from "../services/user.service";
import { SecurityService } from "../services/security.service";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploadMiddleware } from "../middlewares/upload.middleware";
import securityRoutes from "./security.route";

const userRepository = new UserMongoRepository();
const loginHistoryRepository = new LoginHistoryMongoRepository();
const securityService = new SecurityService(userRepository, loginHistoryRepository);
const userService = new UserService(userRepository, loginHistoryRepository, securityService);
const userController = new UserController(userService);

const router = Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/whoami", authorizedMiddleware, userController.whoami);
router.put("/update", uploadMiddleware.single("profileImage"), authorizedMiddleware, userController.updateProfile);
router.post("/verify", authorizedMiddleware, userController.submitVerification);
router.use("/security", securityRoutes);

export default router;
