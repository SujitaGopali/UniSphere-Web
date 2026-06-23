import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { EventMongoRepository } from "../repositories/event.repository";
import { EventService } from "../services/event.service";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const eventRepository = new EventMongoRepository();
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

const router = Router();

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", authorizedMiddleware, eventController.createEvent);
router.put("/:id", authorizedMiddleware, eventController.updateEvent);
router.delete("/:id", authorizedMiddleware, eventController.deleteEvent);

export default router;
