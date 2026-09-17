import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the BookMyShow Replica E2E suite.
 *
 * Starts the backend (Express, port 8000) and the frontend (Next.js dev
 * server, port 3000) before the run and points the base URL at the frontend.
 * The frontend's dev proxy forwards /api to the backend, exercising the real
 * HTTP boundary.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: [
    {
      command: "node ../backend/dist/index.js",
      cwd: __dirname,
      url: "http://localhost:8000/api/health",
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        PORT: "8000",
        CORS_ORIGIN: "http://localhost:3000",
        JWT_SECRET: "e2e-secret",
        DATABASE_PATH: "./data/e2e.db",
        NODE_ENV: "test",
      },
    },
    {
      command: "node node_modules/next/dist/bin/next dev -p 3000",
      cwd: __dirname,
      url: "http://localhost:3000",
      timeout: 120_000,
      reuseExistingServer: true,
      env: {
        BACKEND_URL: "http://localhost:8000",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
