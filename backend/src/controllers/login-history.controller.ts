import { Request, Response } from "express";
import { LoginHistoryMongoRepository } from "../repositories/login-history.repository";
import { ApiResponseHelper } from "../utils/apihelper.util";

const loginHistoryRepository = new LoginHistoryMongoRepository();

export class LoginHistoryController {
  async getAllLoginHistory(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page?.toString() || "1");
      const limit = parseInt(req.query.limit?.toString() || "20");

      const [history, total] = await Promise.all([
        loginHistoryRepository.findAllWithPagination(page, limit),
        loginHistoryRepository.countAll(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        ApiResponseHelper.success(
          200,
          "Login history fetched successfully",
          history,
          {
            page,
            limit,
            total,
            totalPages,
          }
        )
      );
    } catch (error: any) {
      return res.status(error.status || 500).json(
        ApiResponseHelper.error(
          error.status || 500,
          error.message || "Internal Server Error"
        )
      );
    }
  }

  async getUserLoginHistory(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;
      const history = await loginHistoryRepository.findByUserId(userId);

      return res.status(200).json(
        ApiResponseHelper.success(
          200,
          "User login history fetched successfully",
          history
        )
      );
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
