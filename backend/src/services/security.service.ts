import bcrypt from "bcryptjs";
import { HttpException } from "../exceptions/http-exception";
import { IUserRepository } from "../repositories/user.repository";
import { ILoginHistoryRepository } from "../repositories/login-history.repository";
import { emailService } from "./email.service";
import { buildDeviceFingerprint, createSessionId, parseDeviceLabel } from "../utils/device.util";

export class SecurityService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loginHistoryRepository: ILoginHistoryRepository
  ) {}

  async recordLoginSession(
    user: { _id: { toString(): string }; email: string; username: string; firstName: string; loginAlertsEnabled?: boolean },
    ipAddress?: string,
    userAgent?: string
  ) {
    const sessionId = createSessionId();
    const deviceLabel = parseDeviceLabel(userAgent);
    const deviceFingerprint = buildDeviceFingerprint(userAgent);
    const isNewDevice = !(await this.loginHistoryRepository.hasSeenDevice(
      user._id.toString(),
      deviceFingerprint
    ));

    await this.loginHistoryRepository.create({
      userId: user._id.toString(),
      email: user.email,
      username: user.username,
      loginTime: new Date(),
      ipAddress,
      userAgent,
      sessionId,
      deviceLabel,
      deviceFingerprint,
      isActive: true,
      lastActiveAt: new Date(),
    });

    if (isNewDevice && user.loginAlertsEnabled !== false) {
      await emailService.sendLoginAlert(
        user.email,
        user.firstName,
        deviceLabel,
        ipAddress,
        new Date()
      );
    }

    return { sessionId, isNewDevice, deviceLabel };
  }

  async getLoginHistory(userId: string) {
    const history = await this.loginHistoryRepository.findByUserId(userId, 20);
    return history.map((entry) => ({
      id: entry._id,
      sessionId: entry.sessionId,
      deviceLabel: entry.deviceLabel || "Unknown device",
      ipAddress: entry.ipAddress || "Unknown",
      loginTime: entry.loginTime,
      lastActiveAt: entry.lastActiveAt,
      isActive: entry.isActive,
    }));
  }

  async getActiveSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.loginHistoryRepository.findActiveSessionsByUserId(userId);
    return sessions.map((entry) => ({
      id: entry._id,
      sessionId: entry.sessionId,
      deviceLabel: entry.deviceLabel || "Unknown device",
      ipAddress: entry.ipAddress || "Unknown",
      loginTime: entry.loginTime,
      lastActiveAt: entry.lastActiveAt,
      isCurrent: entry.sessionId === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const revoked = await this.loginHistoryRepository.revokeSession(sessionId, userId);
    if (!revoked) {
      throw new HttpException(404, "Session not found");
    }
    return { revoked: true, sessionId };
  }

  async logoutAllDevices(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const revokedCount = await this.loginHistoryRepository.revokeAllSessions(userId);
    const nextVersion = (user.tokenVersion ?? 0) + 1;
    await this.userRepository.update(userId, { tokenVersion: nextVersion });

    return { revokedCount, tokenVersion: nextVersion };
  }

  async updateSecuritySettings(userId: string, loginAlertsEnabled: boolean) {
    const updatedUser = await this.userRepository.update(userId, { loginAlertsEnabled });
    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    return { loginAlertsEnabled: updatedUser.loginAlertsEnabled ?? true };
  }

  async verifyPassword(userId: string, password: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new HttpException(401, "Incorrect password");
    }

    return { verified: true };
  }

  async validateSession(sessionId: string, userId: string) {
    const session = await this.loginHistoryRepository.findBySessionId(sessionId);
    if (!session || session.userId !== userId || !session.isActive) {
      throw new HttpException(401, "Session expired or revoked");
    }
  }
}
