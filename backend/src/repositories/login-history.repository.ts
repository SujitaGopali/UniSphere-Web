import { ILoginHistory, LoginHistoryModel } from "../models/login-history.model";

export interface ILoginHistoryRepository {
  create(data: {
    userId: string;
    email: string;
    username: string;
    loginTime?: Date;
    ipAddress?: string;
    userAgent?: string;
    sessionId: string;
    deviceLabel?: string;
    deviceFingerprint?: string;
    isActive?: boolean;
    lastActiveAt?: Date;
  }): Promise<ILoginHistory>;
  findByUserId(userId: string, limit?: number): Promise<ILoginHistory[]>;
  findActiveSessionsByUserId(userId: string): Promise<ILoginHistory[]>;
  findBySessionId(sessionId: string): Promise<ILoginHistory | null>;
  hasSeenDevice(userId: string, deviceFingerprint: string): Promise<boolean>;
  revokeSession(sessionId: string, userId: string): Promise<boolean>;
  revokeAllSessions(userId: string): Promise<number>;
  findAllWithPagination(page: number, limit: number): Promise<ILoginHistory[]>;
  countAll(): Promise<number>;
}

export class LoginHistoryMongoRepository implements ILoginHistoryRepository {
  async create(data: {
    userId: string;
    email: string;
    username: string;
    loginTime?: Date;
    ipAddress?: string;
    userAgent?: string;
    sessionId: string;
    deviceLabel?: string;
    deviceFingerprint?: string;
    isActive?: boolean;
    lastActiveAt?: Date;
  }): Promise<ILoginHistory> {
    const loginHistory = new LoginHistoryModel({
      ...data,
      isActive: data.isActive ?? true,
      lastActiveAt: data.lastActiveAt ?? new Date(),
    });
    return loginHistory.save();
  }

  async findByUserId(userId: string, limit = 20): Promise<ILoginHistory[]> {
    return LoginHistoryModel.find({ userId }).sort({ loginTime: -1 }).limit(limit);
  }

  async findActiveSessionsByUserId(userId: string): Promise<ILoginHistory[]> {
    return LoginHistoryModel.find({ userId, isActive: true }).sort({ lastActiveAt: -1 });
  }

  async findBySessionId(sessionId: string): Promise<ILoginHistory | null> {
    return LoginHistoryModel.findOne({ sessionId });
  }

  async hasSeenDevice(userId: string, deviceFingerprint: string): Promise<boolean> {
    const existing = await LoginHistoryModel.findOne({ userId, deviceFingerprint });
    return !!existing;
  }

  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await LoginHistoryModel.updateOne(
      { sessionId, userId },
      { $set: { isActive: false } }
    );
    return result.modifiedCount > 0;
  }

  async revokeAllSessions(userId: string): Promise<number> {
    const result = await LoginHistoryModel.updateMany(
      { userId, isActive: true },
      { $set: { isActive: false } }
    );
    return result.modifiedCount;
  }

  async findAllWithPagination(page: number, limit: number): Promise<ILoginHistory[]> {
    return LoginHistoryModel.find()
      .sort({ loginTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async countAll(): Promise<number> {
    return LoginHistoryModel.countDocuments();
  }
}
