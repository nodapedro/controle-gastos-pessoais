import type { Request, RequestHandler } from "express";

import {
  authenticateUser,
  AuthError,
  registerUser,
} from "./auth.service.js";

import { env } from "../../config/env.js";

function regenerateSession(
  req: Request,
  userId: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      req.session.userId = userId;

      req.session.save((saveError) => {
        if (saveError) {
          reject(saveError);
          return;
        }

        resolve();
      });
    });
  });
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const showRegister: RequestHandler = (_req, res) => {
  res.render("auth/register", {
    error: null,
    name: "",
    email: "",
  });
};

export const register: RequestHandler = async (req, res, next) => {
  const body = req.body ?? {};

  const name = getString(body.name).trim();
  const email = getString(body.email).trim().toLowerCase();
  const password = getString(body.password);

  let validationError: string | null = null;

  if (!name || name.length > 100) {
    validationError = "Name is required and must have at most 100 characters.";
  } else if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    validationError = "Please enter a valid email address.";
  } else if (
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    validationError = "Password must have at least 8 characters and at most 72 bytes.";
  }

  if (validationError) {
    res.status(400).render("auth/register", {
      error: validationError,
      name,
      email,
    });
    return;
  }

  try {
    const user = await registerUser(name, email, password);

    await regenerateSession(req, user.id);

    res.redirect("/");
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).render("auth/register", {
        error: error.message,
        name,
        email,
      });
      return;
    }

    next(error);
  }
};

export const showLogin: RequestHandler = (_req, res) => {
  res.render("auth/login", {
    error: null,
    email: "",
  });
};

export const login: RequestHandler = async (req, res, next) => {
  const body = req.body ?? {};

  const email = getString(body.email).trim().toLowerCase();
  const password = getString(body.password);

  if (
    !email ||
    email.length > 254 ||
    !password ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    res.status(401).render("auth/login", {
      error: "Invalid email or password.",
      email,
    });
    return;
  }

  try {
    const user = await authenticateUser(email, password);

    await regenerateSession(req, user.id);

    res.redirect("/");
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).render("auth/login", {
        error: error.message,
        email,
      });
      return;
    }

    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("sid", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.redirect("/login");
  });
};