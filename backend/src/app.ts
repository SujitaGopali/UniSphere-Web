import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import path from "path";
import { HttpException } from "./exceptions/http-exception";
import userRoutes from "./routes/user.route";
import eventRoutes from "./routes/event.route";
import registrationRoutes from "./routes/registration.route";
import { ApiResponseHelper } from "./utils/apihelper.util";

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/registrations", registrationRoutes);

// 404 Handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json(ApiResponseHelper.error(404, "API not found"));
});

// Global Error Handler
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
    if (err instanceof HttpException) {
      res
        .status(err.status)
        .json(ApiResponseHelper.error(err.status, err.message));
      return;
    }

    console.error(err);
    res
      .status(500)
      .json(ApiResponseHelper.error(500, "Internal server error"));
  }
);

export default app;
