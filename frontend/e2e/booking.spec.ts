import { test, expect } from "@playwright/test";

/**
 * E2E for the full booking journey: log in → browse movies → pick a theatre →
 * select seats → pay → see the confirmation. Asserts on content served from
 * the backend, verifies the frontend's network calls to the backend, checks
 * persistence across a reload, and captures console/page errors.
 */
test.describe("Booking journey", () => {
  test("completes browse-to-booked end to end", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    // Log in.
    await page.goto("/login");
    await page.getByLabel(/mobile number/i).fill("9876543210");
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByLabel(/one-time password/i).fill("1234");
    await page.getByRole("button", { name: /verify/i }).click();
    await expect(page).toHaveURL(/\/movies/);

    // The dashboard fetches the catalog from the backend.
    const moviesResponse = page.waitForResponse((r) =>
      r.url().includes("/api/movies")
    );
    await page.reload();
    await moviesResponse;

    // The dashboard lists the seeded movies from the backend.
    await expect(
      page.getByRole("heading", { name: "Paradise" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Bloody Romeo" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "OG2" })).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/movies.png" });

    // Open a movie to see its theatres (fetched from the backend).
    const theatresResponse = page.waitForResponse((r) =>
      r.url().includes("/theatres")
    );
    await page.getByRole("heading", { name: "Paradise" }).click();
    await expect(page).toHaveURL(/\/movies\/\d+/);
    await theatresResponse;
    await expect(page.getByText("Sandhya 70mm")).toBeVisible();
    await expect(page.getByText("Sudharsham 70mm")).toBeVisible();
    await expect(page.getByText("Allu Cinemas")).toBeVisible();

    // Select a theatre and continue to seats.
    await page.getByText("Sandhya 70mm").click();
    await page.getByRole("button", { name: /continue to seats/i }).click();
    await expect(page).toHaveURL(/\/seats/);

    // Select the hardcoded seats and continue to payment.
    await page.getByRole("button", { name: /select seats/i }).click();
    await expect(page.getByText(/A1, A2, A3/)).toBeVisible();
    await expect(page.getByText(/Rs\. 450/)).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/seats.png" });
    await page.getByRole("button", { name: /proceed to pay/i }).click();
    await expect(page).toHaveURL(/\/payment/);

    // Pay with UPI.
    await page.getByRole("button", { name: /upi/i }).click();
    await page.getByLabel(/upi id/i).fill("user@upi");
    await page.screenshot({ path: "e2e/screenshots/payment.png" });

    const bookingResponse = page.waitForResponse((r) =>
      r.url().includes("/api/bookings")
    );
    await page.getByRole("button", { name: /^pay/i }).click();

    // Processing state appears, then the booking POST hits the backend.
    await expect(page.getByText(/processing payment/i)).toBeVisible();
    await bookingResponse;

    // Success screen shows the confirmation returned from the backend.
    await expect(page.getByText(/congratulations/i)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Paradise")).toBeVisible();
    await expect(page.getByText("Sandhya 70mm")).toBeVisible();
    await expect(page.getByText(/A1, A2, A3/)).toBeVisible();
    await expect(page.getByText(/BMS-/)).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/success.png" });

    expect(errors).toEqual([]);
  });

  test("renders the catalog on a mobile viewport", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/movies");
    await expect(
      page.getByRole("heading", { name: "Paradise" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "OG2" })
    ).toBeVisible();
    await page.screenshot({ path: "e2e/screenshots/movies-mobile.png" });
    expect(errors).toEqual([]);
  });
});
