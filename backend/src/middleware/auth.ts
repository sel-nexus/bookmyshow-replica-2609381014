import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

/**
 * Authentication middleware.
 *
 * Verifies the `Authorization: Bearer <token>` JWT issued by the OTP login.
 * On success the decoded mobile number is attached to `res.locals.mobile`.
 * Responds `401` when the token is missing, malformed, or invalid.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ success: false, error: "Missing or malformed Authorization header" });
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { mobile?: string };
    res.locals.mobile = payload.mobile;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}
