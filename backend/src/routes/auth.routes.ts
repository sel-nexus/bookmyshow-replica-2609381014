import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { authService } from "../services/auth.service";
import { validateBody } from "../middleware/validate";

const loginSchema = z.object({
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
});

const verifySchema = z.object({
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  otp: z.string().min(1, "OTP is required"),
});

/**
 * Authentication router: mobile login and OTP verification.
 */
export const authRouter = Router();

/**
 * POST /api/auth/login — accept a mobile number to begin login.
 */
authRouter.post(
  "/login",
  validateBody(loginSchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { mobile } = req.body as z.infer<typeof loginSchema>;
      authService.initiateLogin(mobile);
      res
        .status(200)
        .json({ success: true, message: "OTP sent to your mobile number" });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/verify — verify the OTP and issue a session token.
 */
authRouter.post(
  "/verify",
  validateBody(verifySchema),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { mobile, otp } = req.body as z.infer<typeof verifySchema>;
      const token = authService.verifyOtp(mobile, otp);
      res.status(200).json({ success: true, token });
    } catch (err) {
      next(err);
    }
  }
);
