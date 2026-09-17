import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Request-body validation middleware factory.
 *
 * Validates `req.body` against a zod schema at the trust boundary. On success
 * the parsed (typed) body replaces `req.body`; on failure it responds `400`
 * with the first validation message and does not call the handler.
 *
 * Args:
 *   schema: The zod schema to validate the request body against.
 *
 * Returns:
 *   An Express middleware function.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        res.status(400).json({ success: false, error: message });
        return;
      }
      next(err);
    }
  };
}
