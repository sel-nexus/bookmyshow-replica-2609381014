import { describe, it, expect } from "vitest";
import { AuthService, HARDCODED_OTP } from "../services/auth.service";

/**
 * Unit tests for AuthService — the mobile + hardcoded-OTP login logic.
 */
describe("AuthService", () => {
  const service = new AuthService();

  describe("initiateLogin", () => {
    it("accepts a valid 10-digit mobile number", () => {
      expect(service.initiateLogin("9876543210")).toBe(true);
    });

    it("rejects a mobile number that is too short", () => {
      expect(service.initiateLogin("12345")).toBe(false);
    });

    it("rejects a mobile number with non-numeric characters", () => {
      expect(service.initiateLogin("98abc43210")).toBe(false);
    });

    it("rejects an empty mobile number", () => {
      expect(service.initiateLogin("")).toBe(false);
    });
  });

  describe("verifyOtp", () => {
    it("returns a signed session token for the correct OTP", () => {
      const token = service.verifyOtp("9876543210", HARDCODED_OTP);
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT structure
    });

    it("throws 401 for an incorrect OTP", () => {
      try {
        service.verifyOtp("9876543210", "0000");
        expect.unreachable("should have thrown");
      } catch (err) {
        expect((err as Error & { status?: number }).status).toBe(401);
        expect((err as Error).message).toBe("Invalid OTP");
      }
    });

    it("throws 400 for an invalid mobile number even with the correct OTP", () => {
      try {
        service.verifyOtp("123", HARDCODED_OTP);
        expect.unreachable("should have thrown");
      } catch (err) {
        expect((err as Error & { status?: number }).status).toBe(400);
      }
    });
  });
});
