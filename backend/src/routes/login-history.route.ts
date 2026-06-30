import { Router } from "express";
import { LoginHistoryController } from "../controllers/login-history.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const loginHistoryController = new LoginHistoryController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", loginHistoryController.getAllLoginHistory);
router.get("/user/:id", loginHistoryController.getUserLoginHistory);

export default router;
