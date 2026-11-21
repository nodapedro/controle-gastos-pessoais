import bcrypt from "bcrypt";

import { AppDataSource } from "../../database/data-source.js";
import { User } from "../users/user.entity.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const driverError = (error as {
    driverError?: { code?: string };
  }).driverError;

  return driverError?.code === "23505";
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  const userRepository = AppDataSource.getRepository(User);

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await userRepository.findOneBy({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new AuthError("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = userRepository.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  try {
    await userRepository.save(user);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AuthError("An account with this email already exists.", 409);
    }

    throw error;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
  const userRepository = AppDataSource.getRepository(User);

  const normalizedEmail = email.trim().toLowerCase();

  // passwordHash has select: false in User entity.
  // addSelect explicitly includes it for password verification.
  const user = await userRepository
    .createQueryBuilder("user")
    .addSelect("user.passwordHash")
    .where("user.email = :email", { email: normalizedEmail })
    .getOne();

  if (!user) {
    throw new AuthError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AuthError("Invalid email or password.", 401);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}