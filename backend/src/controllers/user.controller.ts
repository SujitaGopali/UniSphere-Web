import { Request, Response } from "express";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { UserService } from "../services/user.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class UserController {
  constructor(private readonly userService: UserService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);

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

      const user = await this.userService.createUser(parsed.data);

      res
        .status(201)
        .json(
          ApiResponseHelper.success(201, "User registered successfully", user)
        );
    } catch (error) {
      if (error instanceof HttpException) {
        res
          .status(error.status)
          .json(ApiResponseHelper.error(error.status, error.message));
        return;
      }

      res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = LoginUserDTO.safeParse(req.body);

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

      const result = await this.userService.loginUser(parsed.data);

      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Login successful", result));
    } catch (error) {
      if (error instanceof HttpException) {
        res
          .status(error.status)
          .json(ApiResponseHelper.error(error.status, error.message));
        return;
      }

      res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
    }
  };
}
