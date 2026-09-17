import dotenv from "dotenv";
import path from "path";

dotenv.config();

/**
 * Application configuration loaded and validated from environment variables.
 *
 * Fails fast at startup when a required variable is missing so a misconfigured
 * environment surfaces immediately rather than mid-request.
 */
export interface AppConfig {
  /** Port the HTTP server listens on. */
  port: number;
  /** Comma-separated list of allowed CORS origins. */
  corsOrigins: string[];
  /** Secret used to sign session JWTs. */
  jwtSecret: string;
  /** Absolute filesystem path of the SQLite database file. */
  databasePath: string;
  /** Current Node environment (development | production | test). */
  nodeEnv: string;
}

/**
 * Read a required environment variable.
 *
 * Args:
 *   name: The environment variable name.
 *   fallback: Optional default used when the variable is unset.
 *
 * Returns:
 *   The resolved string value.
 *
 * Raises:
 *   Error: When the variable is unset and no fallback is provided.
 */
function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Load and validate the application configuration.
 *
 * Returns:
 *   A validated AppConfig with defaults applied for local development.
 */
export function loadConfig(): AppConfig {
  const corsRaw = requireEnv("CORS_ORIGIN", "http://localhost:3000");
  return {
    port: parseInt(requireEnv("PORT", "8000"), 10),
    corsOrigins: corsRaw.split(",").map((origin) => origin.trim()),
    jwtSecret: requireEnv("JWT_SECRET", "dev-secret-change-in-production"),
    databasePath: path.resolve(
      requireEnv("DATABASE_PATH", "./data/bookmyshow.db")
    ),
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}

export const config = loadConfig();
