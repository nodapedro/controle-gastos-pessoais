import type { RequestHandler } from "express";

const UUID_REGEX = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function validateUuidParam(paramName: string): RequestHandler {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (typeof value !== "string" || !UUID_REGEX.test(value)) {
      res.status(400).send("Invalid ID.");
      return;
    }

    next();
  };
}
