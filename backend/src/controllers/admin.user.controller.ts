import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { UserMongoRepository } from "../repositories/user.repository";

const userRepository = new UserMongoRepository();
const userService = new UserService(userRepository);

export class AdminUserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page?.toString() || "1");
      const limit = parseInt(req.query.limit?.toString() || "10");
      const search = req.query.search?.toString();

      const result = await userService.getAllUsers(page, limit, search);
      return res.status(200).json(ApiResponseHelper.success(200, "Users fetched successfully", result.users, result.meta));
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const user = await userService.getUserById(id);
      return res.status(200).json(ApiResponseHelper.success(200, "User fetched successfully", user));
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const parsed = CreateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json(ApiResponseHelper.error(400, "Validation Error", parsed.error));
      }

      const user = await userService.adminCreateUser({
        ...parsed.data,
        role: req.body.role || "user",
      });
      return res.status(201).json(ApiResponseHelper.success(201, "User created successfully", user));
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const parsed = UpdateUserDTO.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(400)
          .json(ApiResponseHelper.error(400, "Validation Error", parsed.error));
      }

      const user = await userService.adminUpdateUser(id, req.body);
      return res.status(200).json(ApiResponseHelper.success(200, "User updated successfully", user));
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const result = await userService.deleteUser(id);
      return res.status(200).json(ApiResponseHelper.success(200, "User deleted successfully", result));
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }
}
