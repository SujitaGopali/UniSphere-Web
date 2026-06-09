import mongoose from "mongoose";
import { MONGODB_URL } from "../configs/constant";

export async function connectToMongoDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
