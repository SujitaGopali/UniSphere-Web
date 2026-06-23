import { IUser, UserModel } from "../models/user.model";
import { CreateUserDTOType } from "../dtos/user.dto";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByStudentId(studentId: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(data: CreateUserDTOType & { password: string; role: "admin" | "user" }): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
}

export class UserMongoRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return UserModel.findOne({ username });
  }

  async findByStudentId(studentId: string): Promise<IUser | null> {
    return UserModel.findOne({ studentId });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async create(
    data: CreateUserDTOType & { password: string; role: "admin" | "user" }
  ): Promise<IUser> {
    const user = new UserModel(data);
    return user.save();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
