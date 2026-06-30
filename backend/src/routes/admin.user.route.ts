import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
import { authorizedMiddleware, adminMiddleware } from "../middlewares/authorized.middleware";

const adminUserRoutes = Router();
const adminUserController = new AdminUserController();

adminUserRoutes.use(authorizedMiddleware);
adminUserRoutes.use(adminMiddleware);

adminUserRoutes.get("/", adminUserController.getAllUsers);
adminUserRoutes.get("/:id", adminUserController.getUserById);
adminUserRoutes.post("/", adminUserController.createUser);
adminUserRoutes.put("/:id", adminUserController.updateUser);
adminUserRoutes.patch("/:id", adminUserController.updateUser);
adminUserRoutes.delete("/:id", adminUserController.deleteUser);

export default adminUserRoutes;
