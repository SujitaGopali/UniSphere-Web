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

      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;
      
      const result = await this.userService.loginUser(parsed.data, ipAddress, userAgent);

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

  whoami = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userObj = req.user.toObject();
      const { password: _password, ...userWithoutPassword } = userObj;

      res
        .status(200)
        .json(ApiResponseHelper.success(200, "User detail retrieved", userWithoutPassword));
    } catch (error) {
      console.error(error);
      res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const userId = req.user._id.toString();

      let profileImagePath: string | undefined = undefined;
      if (req.file) {
        profileImagePath = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await this.userService.updateProfile(userId, req.body, profileImagePath);

      res
        .status(200)
        .json(ApiResponseHelper.success(200, "Profile updated successfully", updatedUser));
    } catch (error) {
      if (error instanceof HttpException) {
        res
          .status(error.status)
          .json(ApiResponseHelper.error(error.status, error.message));
        return;
      }
      console.error(error);
      res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
    }
  };
}
