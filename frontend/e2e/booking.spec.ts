import { test, expect } from "@playwright/test";

/**
 * E2E for the full booking journey: log in → browse movies → pick a theatre →
 * select seats → pay → see the confirmation. Asserts on content served from
 * the backend, not just page loads.
 */
test.describe("Booking journey", () => {
  test("completes browse-to-booked end to end", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    // Log in.
    await page.goto("/login");
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByLabel(/one-time password/i).fill("1234");
    await page.getByRole("button", { name: /verify/i }).click();
    await expect(page).toHaveURL(/\/movies/);

    // The dashboard lists the seeded movies from the backend.
    await expect(
      page.getByRole("heading", { name: "Paradise" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bloody Romeo" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "OG2" })).toBeVisible();

    // Open a movie to see its theatres.
    await page.getByRole("heading", { name: "Paradise" }).click();
    await expect(page).toHaveURL(/\/movies\/\d+/);
    await expect(page.getByText("Sandhya 70mm")).toBeVisible();
    await expect(page.getByText("Sudharsham 70mm")).toBeVisible();
    await expect(page.getByText("Allu Cinemas")).toBeVisible();

    // Select a theatre and continue to seats.
    await page.getByText("Sandhya 70mm").click();
    await page
      .getByRole("button", { name: /continue to seats/i })
      .click();
    await expect(page).toHaveURL(/\/seats/);

    // Select the hardcoded seats and continue to payment.
    await page.getByRole("button", { name: /select seats/i }).click();
    await expect(page.getByText(/A1/)).toBeVisible();
    await expect(page.getByText(/450/)).toBeVisible();
    await page
      .getByRole("button", { name: /proceed to pay|continue|pay/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/payment/);

    // Pay with UPI.
    await page.getByLabel(/upi id/i).fill("user@upi");
    await page.getByRole("button", { name: /^pay/i }).click();

    // Processing state appears, then the success screen.
    await expect(page.getByText(/processing payment/i)).toBeVisible();
    await expect(
      page.getByText(/congratulations/i)
    ).toBeVisible({ timeout: 10000 });

    // Confirmation shows the booked movie, theatre, and seats.
    await expect(page.getByText("Paradise")).toBeVisible();
    await expect(page.getByText("Sandhya 70mm")).toBeVisible();
    await expect(page.getByText(/A1/)).toBeVisible();

    expect(consoleErrors).toEqual([]);
  });
});
