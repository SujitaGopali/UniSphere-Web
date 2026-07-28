import { expect, test } from "@playwright/test";

const testUser = {
  firstName: "E2E",
  lastName: "Student",
  email: `e2e.student.${Date.now()}@college.edu`,
  username: `e2euser${Date.now()}`,
  studentId: `E2E-${Date.now()}`,
  password: "password123",
  role: "user",
  college: "Test College",
};

test.describe("Profile security", () => {
  test.beforeAll(async ({ request }) => {
    const registerResponse = await request.post("http://127.0.0.1:8089/api/v1/auth/register", {
      data: testUser,
    });

    expect(registerResponse.ok()).toBeTruthy();
  });

  test("authenticated user can open profile security section", async ({ page, request }) => {
    const loginResponse = await request.post("http://127.0.0.1:8089/api/v1/auth/login", {
      data: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const loginBody = await loginResponse.json();
    const token = loginBody.data.token as string;

    await page.context().addCookies([
      {
        name: "auth_token",
        value: token,
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
      {
        name: "user_data",
        value: JSON.stringify(loginBody.data.user),
        domain: "127.0.0.1",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/dashboard/profile");

    await expect(page.getByRole("heading", { name: /my profile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^security$/i })).toBeVisible();
    await expect(page.getByText(/where you're logged in/i)).toBeVisible();
    await expect(page.getByText(/recent login activity/i)).toBeVisible();
  });
});
