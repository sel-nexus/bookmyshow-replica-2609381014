import { test, expect } from "@playwright/test";

/**
 * E2E for the authentication journey: mobile entry → OTP verification →
 * landing on the movie dashboard with a session established.
 */
test.describe("Authentication", () => {
  test("logs in with a mobile number and the hardcoded OTP", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /sign in/i })
    ).toBeVisible();

    // Enter a mobile number and continue to the OTP screen.
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();

    await expect(page).toHaveURL(/\/login\/otp/);
    await expect(
      page.getByRole("heading", { name: /enter otp/i })
    ).toBeVisible();

    // Enter the hardcoded OTP and verify.
    await page.getByLabel(/one-time password/i).fill("1234");
    await page.getByRole("button", { name: /verify/i }).click();

    // Lands on the movie dashboard.
    await expect(page).toHaveURL(/\/movies/);

    expect(consoleErrors).toEqual([]);
  });

  test("rejects an incorrect OTP with an error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/login\/otp/);

    await page.getByLabel(/one-time password/i).fill("0000");
    await page.getByRole("button", { name: /verify/i }).click();

    await expect(page.getByText(/invalid otp/i)).toBeVisible();
  });
});
