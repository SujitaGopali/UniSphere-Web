import { Request, Response } from "express";
import { HttpException } from "../exceptions/http-exception";
import { SecurityService } from "../services/security.service";
import { ApiResponseHelper } from "../utils/apihelper.util";

export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  getLoginHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const history = await this.securityService.getLoginHistory(req.user._id.toString());
      res.status(200).json(ApiResponseHelper.success(200, "Login history retrieved", history));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const sessions = await this.securityService.getActiveSessions(
        req.user._id.toString(),
        req.sessionId
      );
      res.status(200).json(
        ApiResponseHelper.success(200, "Active sessions retrieved", {
          sessions,
          loginAlertsEnabled: req.user.loginAlertsEnabled ?? true,
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  };

  revokeSession = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const sessionId = req.params.sessionId as string;
      const result = await this.securityService.revokeSession(req.user._id.toString(), sessionId);
      const revokedCurrentSession = sessionId === req.sessionId;

      res.status(200).json(
        ApiResponseHelper.success(200, "Session revoked", {
          ...result,
          revokedCurrentSession,
        })
      );
    } catch (error) {
      this.handleError(res, error);
    }
  };

  logoutAllDevices = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const result = await this.securityService.logoutAllDevices(req.user._id.toString());
      res.status(200).json(ApiResponseHelper.success(200, "Logged out of all devices", result));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  verifyPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      const password = req.body?.password;
      if (!password) {
        res.status(400).json(ApiResponseHelper.error(400, "Password is required"));
        return;
      }

      const result = await this.securityService.verifyPassword(req.user._id.toString(), password);
      res.status(200).json(ApiResponseHelper.success(200, "Password verified", result));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json(ApiResponseHelper.error(401, "Unauthorized"));
        return;
      }

      if (typeof req.body?.loginAlertsEnabled !== "boolean") {
        res.status(400).json(ApiResponseHelper.error(400, "loginAlertsEnabled must be a boolean"));
        return;
      }

      const result = await this.securityService.updateSecuritySettings(
        req.user._id.toString(),
        req.body.loginAlertsEnabled
      );
      res.status(200).json(ApiResponseHelper.success(200, "Security settings updated", result));
    } catch (error) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown): void {
    if (error instanceof HttpException) {
      res.status(error.status).json(ApiResponseHelper.error(error.status, error.message));
      return;
    }

    console.error(error);
    res.status(500).json(ApiResponseHelper.error(500, "Internal server error"));
  }
}
