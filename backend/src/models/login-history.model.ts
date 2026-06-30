import { Schema, model, Document } from "mongoose";

export interface ILoginHistory extends Document {
  userId: string;
  email: string;
  username: string;
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
  },
  { timestamps: true }
);

export const LoginHistoryModel = model<ILoginHistory>("LoginHistory", loginHistorySchema);
