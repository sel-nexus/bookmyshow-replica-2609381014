import jwt from "jsonwebtoken";
import { config } from "../config";

/** The hardcoded OTP accepted by this replica (no real SMS provider). */
export const HARDCODED_OTP = "1234";

/**
 * Authentication service.
 *
 * Implements the mobile-number + hardcoded-OTP login flow. No user record is
 * persisted; a successful OTP verification issues a signed session token.
 */
export class AuthService {
  /**
   * Begin a login by validating the mobile number.
   *
   * Args:
   *   mobile: The user's mobile number.
   *
   * Returns:
   *   True when the mobile number is a valid 10-digit identifier.
   */
  initiateLogin(mobile: string): boolean {
    return /^[0-9]{10}$/.test(mobile);
  }

  /**
   * Verify the OTP and, on success, issue a session token.
   *
   * Args:
   *   mobile: The user's mobile number.
   *   otp: The one-time password entered by the user.
   *
   * Returns:
   *   A signed JWT session token when the OTP matches.
   *
   * Raises:
   *   Error: With `status: 401` when the OTP does not match.
   */
  verifyOtp(mobile: string, otp: string): string {
    if (!this.initiateLogin(mobile)) {
      const err = new Error("Invalid mobile number") as Error & {
        status?: number;
      };
      err.status = 400;
      throw err;
    }
    if (otp !== HARDCODED_OTP) {
      const err = new Error("Invalid OTP") as Error & { status?: number };
      err.status = 401;
      throw err;
    }
    return jwt.sign({ mobile }, config.jwtSecret, { expiresIn: "2h" });
  }
}

export const authService = new AuthService();
