import { loginSchema, registerSchema } from "@/app/(auth)/_components/schema";

describe("auth schemas (integration)", () => {
  it("accepts valid login values", () => {
    const result = loginSchema.safeParse({
      email: "student@college.edu",
      password: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret123",
    });

    expect(result.success).toBe(false);
  });

  it("accepts valid register values", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "student@college.edu",
      college: "Test College",
      role: "user",
      password: "secret123",
      confirmPassword: "secret123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects register values when passwords do not match", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "student@college.edu",
      college: "Test College",
      role: "user",
      password: "secret123",
      confirmPassword: "different",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("confirmPassword"))).toBe(true);
    }
  });
});
