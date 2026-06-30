import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTOType, LoginUserDTOType } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { IUserRepository } from "../repositories/user.repository";
import { ILoginHistoryRepository } from "../repositories/login-history.repository";
import { SECRET_KEY } from "../configs/constant";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loginHistoryRepository?: ILoginHistoryRepository
  ) {}

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

  async loginUser(data: LoginUserDTOType, ipAddress?: string, userAgent?: string) {
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

    // Record login history
    if (this.loginHistoryRepository) {
      await this.loginHistoryRepository.create({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        loginTime: new Date(),
        ipAddress,
        userAgent,
      });
    }

    const userWithoutPassword = this.omitPassword(user);
    console.log('Login user data:', { role: userWithoutPassword.role, email: userWithoutPassword.email }); // Debug logging

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async updateProfile(userId: string, data: any, profileImage?: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (data.username && data.username !== user.username) {
      const existing = await this.userRepository.findByUsername(data.username);
      if (existing) {
        throw new HttpException(409, "Username already in use");
      }
    }

    if (data.studentId && data.studentId !== user.studentId) {
      const existing = await this.userRepository.findByStudentId(data.studentId);
      if (existing) {
        throw new HttpException(409, "Student ID already in use");
      }
    }

    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.username) updateData.username = data.username;
    if (data.studentId) updateData.studentId = data.studentId;
    if (profileImage) updateData.profileImage = profileImage;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update profile");
    }

    return this.omitPassword(updatedUser);
  }

  async getAllUsers(page: number, limit: number, search?: string) {
    const total = await this.userRepository.countUsers(search);
    const users = await this.userRepository.findAllWithPaginationAndSearch(
      page,
      limit,
      search
    );

    return {
      users: users.map((u) => this.omitPassword(u)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return this.omitPassword(user);
  }

  async adminCreateUser(data: any) {
    // Check uniqueness
    if (await this.userRepository.findByEmail(data.email)) {
      throw new HttpException(409, "Email already in use");
    }
    if (await this.userRepository.findByUsername(data.username)) {
      throw new HttpException(409, "Username already in use");
    }
    if (await this.userRepository.findByStudentId(data.studentId)) {
      throw new HttpException(409, "Student ID already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.omitPassword(user);
  }

  async adminUpdateUser(id: string, data: any) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (data.email && data.email !== user.email) {
      if (await this.userRepository.findByEmail(data.email)) {
        throw new HttpException(409, "Email already in use");
      }
    }
    if (data.username && data.username !== user.username) {
      if (await this.userRepository.findByUsername(data.username)) {
        throw new HttpException(409, "Username already in use");
      }
    }
    if (data.studentId && data.studentId !== user.studentId) {
      if (await this.userRepository.findByStudentId(data.studentId)) {
        throw new HttpException(409, "Student ID already in use");
      }
    }

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update user");
    }
    return this.omitPassword(updatedUser);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    await this.userRepository.deleteById(id);
    return { id };
  }

  private omitPassword(user: IUser) {
    const userObject = user.toObject();
    const { password: _password, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }
}
