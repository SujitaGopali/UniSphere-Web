import { expect, test } from "@playwright/test";

test.describe("Auth pages", () => {
  test("login page renders the sign-in form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page renders the registration form", async ({ page }) => {
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
    await expect(page.getByPlaceholder("Ram Lal")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("shows validation feedback for empty login submission", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });
});
