import bcrypt from "bcryptjs";
import { SecurityService } from "../../src/services/security.service";
import { IUser } from "../../src/models/user.model";

function createMockUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: { toString: () => "user-123" },
    firstName: "Test",
    lastName: "User",
    email: "test.user@college.edu",
    username: "testuser",
    studentId: "STU-1",
    password: "hashed",
    role: "user",
    verificationStatus: "none",
    loginAlertsEnabled: true,
    tokenVersion: 0,
    ...overrides,
  } as unknown as IUser;
}

describe("SecurityService (unit)", () => {
  const userRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const loginHistoryRepository = {
    create: jest.fn(),
    hasSeenDevice: jest.fn(),
    findByUserId: jest.fn(),
    findActiveSessionsByUserId: jest.fn(),
    revokeSession: jest.fn(),
    revokeAllSessions: jest.fn(),
  };

  const securityService = new SecurityService(
    userRepository as any,
    loginHistoryRepository as any
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("records a login session and sends alert for a new device", async () => {
    loginHistoryRepository.hasSeenDevice.mockResolvedValue(false);
    loginHistoryRepository.create.mockResolvedValue({});

    const result = await securityService.recordLoginSession(
      createMockUser(),
      "127.0.0.1",
      "Mozilla/5.0 Chrome/120.0 Windows"
    );

    expect(result.isNewDevice).toBe(true);
    expect(result.sessionId).toBeTruthy();
    expect(loginHistoryRepository.create).toHaveBeenCalledTimes(1);
  });

  it("does not treat repeat device logins as new", async () => {
    loginHistoryRepository.hasSeenDevice.mockResolvedValue(true);
    loginHistoryRepository.create.mockResolvedValue({});

    const result = await securityService.recordLoginSession(
      createMockUser(),
      "127.0.0.1",
      "Mozilla/5.0 Chrome/120.0 Windows"
    );

    expect(result.isNewDevice).toBe(false);
  });

  it("verifies the correct password", async () => {
    const hashed = await bcrypt.hash("secret123", 10);
    userRepository.findById.mockResolvedValue(createMockUser({ password: hashed }));

    const result = await securityService.verifyPassword("user-123", "secret123");
    expect(result.verified).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hashed = await bcrypt.hash("secret123", 10);
    userRepository.findById.mockResolvedValue(createMockUser({ password: hashed }));

    await expect(securityService.verifyPassword("user-123", "wrong-pass")).rejects.toMatchObject({
      status: 401,
    });
  });

  it("logs out all devices by revoking sessions and bumping token version", async () => {
    userRepository.findById.mockResolvedValue(createMockUser({ tokenVersion: 2 }));
    loginHistoryRepository.revokeAllSessions.mockResolvedValue(3);
    userRepository.update.mockResolvedValue(createMockUser({ tokenVersion: 3 }));

    const result = await securityService.logoutAllDevices("user-123");

    expect(result.revokedCount).toBe(3);
    expect(result.tokenVersion).toBe(3);
    expect(userRepository.update).toHaveBeenCalledWith("user-123", { tokenVersion: 3 });
  });
});
