import { Router } from "express";
import { RegistrationController } from "../controllers/registration.controller";
import { RegistrationMongoRepository } from "../repositories/registration.repository";
import { EventMongoRepository } from "../repositories/event.repository";
import { RegistrationService } from "../services/registration.service";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const registrationRepository = new RegistrationMongoRepository();
const eventRepository = new EventMongoRepository();
const registrationService = new RegistrationService(registrationRepository, eventRepository);
const registrationController = new RegistrationController(registrationService);

const router = Router();

router.get("/my", authorizedMiddleware, registrationController.getMyRegistrations);
router.post("/", authorizedMiddleware, registrationController.register);
router.delete("/:id", authorizedMiddleware, registrationController.cancel);

export default router;
