import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { HttpException } from "./exceptions/http-exception";
import userRoutes from "./routes/user.route";
import { ApiResponseHelper } from "./utils/apihelper.util";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", userRoutes);

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
