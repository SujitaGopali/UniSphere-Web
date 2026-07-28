import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../configs/constant";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { LoginHistoryMongoRepository } from "../repositories/login-history.repository";
import { UserMongoRepository } from "../repositories/user.repository";
import { ApiResponseHelper } from "../utils/apihelper.util";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      sessionId?: string;
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user";
  sessionId?: string;
  tokenVersion?: number;
}

const userRepository = new UserMongoRepository();
const loginHistoryRepository = new LoginHistoryMongoRepository();

export const authorizedMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json(ApiResponseHelper.error(401, "Authorization token required"));
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      res.status(401).json(ApiResponseHelper.error(401, "User not found"));
      return;
    }

    if (
      typeof decoded.tokenVersion === "number" &&
      decoded.tokenVersion !== (user.tokenVersion ?? 0)
    ) {
      res.status(401).json(ApiResponseHelper.error(401, "Session expired. Please log in again."));
      return;
    }

    if (decoded.sessionId) {
      const session = await loginHistoryRepository.findBySessionId(decoded.sessionId);
      if (!session || session.userId !== user._id.toString() || !session.isActive) {
        res.status(401).json(ApiResponseHelper.error(401, "Session expired or revoked"));
        return;
      }
      req.sessionId = decoded.sessionId;
    }

    req.user = user;
    next();
  } catch {
    res
      .status(401)
      .json(ApiResponseHelper.error(401, "Invalid or expired token"));
  }
};

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    res
      .status(403)
      .json(ApiResponseHelper.error(403, "Admin access required"));
    return;
  }

  next();
};

export { HttpException };
