import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTOType, LoginUserDTOType } from "../dtos/user.dto";
import { HttpException } from "../exceptions/http-exception";
import { IUser } from "../models/user.model";
import { IUserRepository } from "../repositories/user.repository";
import { ILoginHistoryRepository } from "../repositories/login-history.repository";
import { SecurityService } from "./security.service";
import { SECRET_KEY } from "../configs/constant";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loginHistoryRepository?: ILoginHistoryRepository,
    private readonly securityService?: SecurityService
  ) {}

  async createUser(data: CreateUserDTOType) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existingEmail = await this.userRepository.findByEmail(normalizedEmail);
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
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role || "user",
    });

    return this.omitPassword(user);
  }

  async loginUser(data: LoginUserDTOType, ipAddress?: string, userAgent?: string) {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const tokenVersion = user.tokenVersion ?? 0;
    let sessionId: string | undefined;

    if (this.securityService) {
      const session = await this.securityService.recordLoginSession(user, ipAddress, userAgent);
      sessionId = session.sessionId;
    } else if (this.loginHistoryRepository) {
      sessionId = undefined;
      await this.loginHistoryRepository.create({
        userId: user._id.toString(),
        email: user.email,
        username: user.username,
        loginTime: new Date(),
        ipAddress,
        userAgent,
        sessionId: `legacy-${Date.now()}`,
        deviceLabel: "Unknown device",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        sessionId,
        tokenVersion,
      },
      SECRET_KEY,
      { expiresIn: "30d" }
    );

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
    if (data.college) updateData.college = data.college;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
    if (data.interests !== undefined) updateData.interests = data.interests;
    if (profileImage) updateData.profileImage = profileImage;

    if (data.password) {
      if (!data.currentPassword) {
        throw new HttpException(400, "Current password is required to set a new password");
      }

      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new HttpException(401, "Current password is incorrect");
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new HttpException(500, "Failed to update profile");
    }

    return this.omitPassword(updatedUser);
  }

  async submitVerification(userId: string, idImage: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    if (!user.college) {
      throw new HttpException(400, "Please update your college in your profile first");
    }

    const updatedUser = await this.userRepository.update(userId, {
      verificationStatus: "pending",
      idImage,
    });

    if (!updatedUser) {
      throw new HttpException(500, "Failed to submit verification");
    }

    return this.omitPassword(updatedUser);
  }

  async getPendingVerifications(page: number, limit: number, college?: string) {
    const [total, users] = await Promise.all([
      this.userRepository.countPendingVerifications(college),
      this.userRepository.findPendingVerifications(page, limit, college),
    ]);

    return {
      verifications: users.map((u) => this.omitPassword(u, { includeIdImage: true })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async reviewVerification(id: string, approved: boolean, reviewerCollege?: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    // Coordinators only see their own college's queue, so they must not be able
    // to review a student from another college by posting a raw id.
    if (reviewerCollege?.trim()) {
      const sameCollege =
        user.college?.trim().toLowerCase() === reviewerCollege.trim().toLowerCase();
      if (!sameCollege) {
        throw new HttpException(403, "You can only review students from your own college");
      }
    }

    if (user.verificationStatus !== "pending") {
      throw new HttpException(400, "User verification is not pending");
    }

    const updatedUser = await this.userRepository.update(id, {
      verificationStatus: approved ? "approved" : "rejected",
    });

    if (!updatedUser) {
      throw new HttpException(500, "Failed to update verification status");
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
    // Profile images are only changed by the user on their own profile page.
    delete updateData.profileImage;
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

  private omitPassword(user: IUser, options?: { includeIdImage?: boolean }) {
    const userObject = user.toObject();
    const {
      password: _password,
      idImage,
      ...userWithoutPassword
    } = userObject;

    // idImage can be a huge base64 string. Never send it on login/whoami —
    // it blows past the browser cookie size limit and silently breaks student login.
    if (options?.includeIdImage && idImage) {
      return { ...userWithoutPassword, idImage };
    }
    return userWithoutPassword;
  }
}
