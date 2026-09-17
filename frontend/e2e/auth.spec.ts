import { test, expect } from "@playwright/test";

/**
 * E2E for the authentication journey: mobile entry → OTP verification →
 * landing on the movie dashboard with a session established. Captures both
 * console errors and page errors and asserts none occur.
 */
test.describe("Authentication", () => {
  test("logs in with a mobile number and the hardcoded OTP", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /sign in/i })
    ).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/login.png" });

    // The login call hits the backend.
    const loginResponse = page.waitForResponse((r) =>
      r.url().includes("/api/auth/login")
    );
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();
    await loginResponse;

    await expect(page).toHaveURL(/\/login\/otp/);
    await expect(
      page.getByRole("heading", { name: /enter otp/i })
    ).toBeVisible();

    // The verify call hits the backend and returns a token.
    const verifyResponse = page.waitForResponse((r) =>
      r.url().includes("/api/auth/verify")
    );
    await page.getByLabel(/one-time password/i).fill("1234");
    await page.getByRole("button", { name: /verify/i }).click();
    await verifyResponse;

    await expect(page).toHaveURL(/\/movies/);
    await page.screenshot({ path: "e2e/screenshots/movies-after-login.png" });

    expect(errors).toEqual([]);
  });

  test("rejects an incorrect OTP with an error message", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/login");
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/login\/otp/);

    await page.getByLabel(/one-time password/i).fill("0000");
    await page.getByRole("button", { name: /verify/i }).click();

    await expect(page.getByText(/invalid otp/i)).toBeVisible();
    expect(errors).toEqual([]);
  });
});
