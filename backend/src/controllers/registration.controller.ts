import { Request, Response } from "express";
import { CreateRegistrationDTO } from "../dtos/registration.dto";
import { HttpException } from "../exceptions/http-exception";
import { RegistrationService } from "../services/registration.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateRegistrationDTO.safeParse(req.body);

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
      const registration = await this.registrationService.registerForEvent(
        userId,
        parsed.data.eventId
      );

      res
        .status(201)
        .json(
          ApiResponseHelper.success(
            201,
            "Successfully registered for the event",
            registration
          )
        );
    } catch (error) {
      this.handleError(res, error);
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;

      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userId = req.user._id.toString();
      const result = await this.registrationService.cancelRegistration(userId, id);

      res
        .status(200)
        .json(ApiResponseHelper.success(200, result.message, null));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userId = req.user._id.toString();
      const registrations = await this.registrationService.getUserRegistrations(userId);

      res
        .status(200)
        .json(
          ApiResponseHelper.success(
            200,
            "Registrations retrieved successfully",
            registrations
          )
        );
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
