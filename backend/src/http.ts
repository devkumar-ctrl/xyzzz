import type { NextFunction, Request, Response } from "express";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function asyncHandler(
  handler: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function isObject(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    res.status(400).json({ error: "The request body is not valid JSON." });
    return;
  }

  console.error("API error", error);
  res.status(500).json({ error: "Something went wrong on the academy API." });
}
