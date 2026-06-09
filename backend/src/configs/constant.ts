import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || "8089";
export const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/class-36a-db";
export const SECRET_KEY = process.env.SECRET_KEY || "merosecretkey";
