import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import { HttpException } from "./exceptions/http-exception";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import registrationRoutes from "./routes/registration.route";
import adminUserRoutes from "./routes/admin.user.route";
import loginHistoryRoutes from "./routes/login-history.route";
import { ApiResponseHelper } from "./utils/apihelper.util";

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req: Request, res: Response): void => {
  res.status(200).json({ message: "UniSphere API is running" });
});

app.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({ ok: true });
});

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/registrations", registrationRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/login-history", loginHistoryRoutes);

app.use((_req: Request, res: Response): void => {
  res.status(404).json(ApiResponseHelper.error(404, "API not found"));
});

app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpException) {
      res
        .status(err.status)
        .json(ApiResponseHelper.error(err.status, err.message));
      return;
    }

    if ((err as any).type === "entity.too.large") {
      res.status(413).json(ApiResponseHelper.error(413, "Request payload too large"));
      return;
    }

    console.error(err);
    res
      .status(500)
      .json(ApiResponseHelper.error(500, "Internal server error"));
  }
);

export default app;
