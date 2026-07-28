import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  studentId: string;
  password: string;
  profileImage?: string;
  role: "admin" | "user";
  college?: string;
  department?: string;
  year?: string;
  phoneNumber?: string;
  interests?: string;
  verificationStatus: "none" | "pending" | "approved" | "rejected";
  idImage?: string;
  loginAlertsEnabled: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: false },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    college: { type: String, required: false },
    department: { type: String, required: false },
    year: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    interests: { type: String, required: false },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    idImage: { type: String, required: false },
    loginAlertsEnabled: { type: Boolean, default: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const UserModel = model<IUser>("User", userSchema);
