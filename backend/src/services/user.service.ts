import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTOType, LoginUserDTOType } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { IUserRepository } from "../repositories/user.repository";
import { SECRET_KEY } from "../configs/constant";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(data: CreateUserDTOType) {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new HttpException(409, "Email already in use");
    }

    const existingUsername = await this.userRepository.findByUsername(
      data.username
    );
    if (existingUsername) {
      throw new HttpException(409, "Username already in use");
    }

    const existingStudentId = await this.userRepository.findByStudentId(
      data.studentId
    );
    if (existingStudentId) {
      throw new HttpException(409, "Student ID already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
      role: "user",
    });

    return this.omitPassword(user);
  }

  async loginUser(data: LoginUserDTOType) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "30d" }
    );

    return {
      token,
      user: this.omitPassword(user),
    };
  }

  private omitPassword(user: IUser) {
    const userObject = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }
}
