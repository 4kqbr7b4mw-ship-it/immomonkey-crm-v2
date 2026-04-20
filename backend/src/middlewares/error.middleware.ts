import { NextFunction, Request, Response } from "express";

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("API-Fehler:", err);

  res.status(500).json({
    message: "Interner Serverfehler",
  });
}