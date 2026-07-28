import { Schema, model, Document } from "mongoose";

export interface ILoginHistory extends Document {
  userId: string;
  email: string;
  username: string;
  loginTime: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId: string;
  deviceLabel?: string;
  deviceFingerprint?: string;
  isActive: boolean;
  lastActiveAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
    sessionId: { type: String, required: true, unique: true, sparse: true },
    deviceLabel: { type: String, required: false },
    deviceFingerprint: { type: String, required: false },
    isActive: { type: Boolean, default: true },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

loginHistorySchema.index({ userId: 1, loginTime: -1 });
loginHistorySchema.index({ userId: 1, deviceFingerprint: 1 });

export const LoginHistoryModel = model<ILoginHistory>("LoginHistory", loginHistorySchema);
