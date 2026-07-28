import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SecuritySettings from "@/app/dashboard/_components/SecuritySettings";

// jest.mock is hoisted above these consts, so the factories must only reference
// them lazily from inside a callback - never dereference at factory time.
const mockGet = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();
const mockPost = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("@/lib/api/axios-instance", () => ({
  __esModule: true,
  default: {
    get: (...args: unknown[]) => mockGet(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
}));

jest.mock("@/lib/cookies", () => ({
  clearAuthCookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe("SecuritySettings (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGet.mockImplementation((url: string) => {
      if (url.includes("login-history")) {
        return Promise.resolve({
          data: {
            success: true,
            data: [
              {
                id: "1",
                sessionId: "session-1",
                deviceLabel: "Chrome on Windows",
                ipAddress: "127.0.0.1",
                loginTime: "2026-01-01T10:00:00.000Z",
                lastActiveAt: "2026-01-01T10:00:00.000Z",
                isActive: true,
              },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          success: true,
          data: {
            loginAlertsEnabled: true,
            sessions: [
              {
                id: "1",
                sessionId: "session-1",
                deviceLabel: "Chrome on Windows",
                ipAddress: "127.0.0.1",
                loginTime: "2026-01-01T10:00:00.000Z",
                lastActiveAt: "2026-01-01T10:00:00.000Z",
                isCurrent: true,
              },
            ],
          },
        },
      });
    });
  });

  it("loads and renders security data", async () => {
    render(<SecuritySettings />);

    expect(await screen.findByText("Security")).toBeInTheDocument();
    // "This device" only renders once the sessions request resolves, so await it
    // rather than asserting synchronously against the pre-fetch render.
    expect(await screen.findByText("This device")).toBeInTheDocument();
    expect(screen.getAllByText("Chrome on Windows").length).toBeGreaterThan(0);
    expect(screen.getByText(/where you're logged in/i)).toBeInTheDocument();
  });

  it("updates login alert settings", async () => {
    mockPut.mockResolvedValue({
      data: {
        success: true,
        data: { loginAlertsEnabled: false },
      },
    });

    render(<SecuritySettings />);

    // Let the initial load settle first, otherwise it races the toggle update.
    await screen.findByText("This device");

    const toggle = await screen.findByRole("checkbox");
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith("/api/v1/auth/security/settings", {
        loginAlertsEnabled: false,
      });
    });

    expect(await screen.findByText("Login alerts disabled.")).toBeInTheDocument();
  });
});
