import { ILoginHistory, LoginHistoryModel } from "../models/login-history.model";

export interface ILoginHistoryRepository {
  create(data: {
    userId: string;
    email: string;
    username: string;
    loginTime?: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<ILoginHistory>;
  findByUserId(userId: string): Promise<ILoginHistory[]>;
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
  }): Promise<ILoginHistory> {
    const loginHistory = new LoginHistoryModel(data);
    return loginHistory.save();
  }

  async findByUserId(userId: string): Promise<ILoginHistory[]> {
    return LoginHistoryModel.find({ userId }).sort({ loginTime: -1 }).limit(10);
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
