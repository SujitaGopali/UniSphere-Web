import { Request, Response } from "express";
import { CreateEventDTO, UpdateEventDTO } from "../dtos/event.dto";
import { HttpException } from "../exceptions/http-exception";
import { EventService } from "../services/event.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class EventController {
  constructor(private readonly eventService: EventService) {}

  getAllEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const events = await this.eventService.getAllEvents();
      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Events retrieved successfully", events));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const event = await this.eventService.getEventById(id);
      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Event retrieved successfully", event));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateEventDTO.safeParse(req.body);

      if (!parsed.success) {
        res
          .status(400)
          .json(
            ApiResponseHelper.error(
              400,
              parsed.error.issues.map((issue) => issue.message).join(", ")
            )
          );
        return;
      }

      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const organizerId = req.user._id.toString();
      const event = await this.eventService.createEvent(parsed.data, organizerId);

      res
        .status(201)
        .json(ApiResponseHelper.success(201, "Event created successfully", event));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const parsed = UpdateEventDTO.safeParse(req.body);

      if (!parsed.success) {
        res
          .status(400)
          .json(
            ApiResponseHelper.error(
              400,
              parsed.error.issues.map((issue) => issue.message).join(", ")
            )
          );
        return;
      }

      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userId = req.user._id.toString();
      const userRole = req.user.role;
      const event = await this.eventService.updateEvent(id, parsed.data, userId, userRole);

      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Event updated successfully", event));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userId = req.user._id.toString();
      const userRole = req.user.role;
      await this.eventService.deleteEvent(id, userId, userRole);

      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Event deleted successfully", null));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: any) {
    if (error instanceof HttpException) {
      res
        .status(error.status)
        .json(ApiResponseHelper.error(error.status, error.message));
      return;
    }

    console.error(error);
    res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
  }
}
