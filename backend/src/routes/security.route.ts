import { Router } from "express";
import { SecurityController } from "../controllers/security.controller";
import { LoginHistoryMongoRepository } from "../repositories/login-history.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { SecurityService } from "../services/security.service";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const userRepository = new UserMongoRepository();
const loginHistoryRepository = new LoginHistoryMongoRepository();
const securityService = new SecurityService(userRepository, loginHistoryRepository);
const securityController = new SecurityController(securityService);

const router = Router();

router.use(authorizedMiddleware);

router.get("/login-history", securityController.getLoginHistory);
router.get("/sessions", securityController.getSessions);
router.delete("/sessions/:sessionId", securityController.revokeSession);
router.post("/logout-all", securityController.logoutAllDevices);
router.post("/verify-password", securityController.verifyPassword);
router.put("/settings", securityController.updateSettings);

export default router;
