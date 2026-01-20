import jwt from "jsonwebtoken";
import { authTokenModel, IUser } from "@aster/db";
import { AppError } from "../errors";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const generatePasswordHash = async (
  password: string,
): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = async (
  user: IUser,
  expiresIn?: string,
): Promise<string> => {
  if (!process.env.JWT_SIGNING_SECRET) {
    console.log(
      "JWT_SIGNING_SECRET is not defined in the environment variables",
    );
    throw AppError({
      message: "Token generation failed",
      statusCode: 500,
    });
  }

  const authToken = await authTokenModel.getOne({ user: user._id });
  if (authToken) {
    return authToken.token;
  }

  const payload = {
    id: user._id,
    email: user.email,
  };

  // If expiresIn is provided, include it in the options; otherwise, omit it
  const options: jwt.SignOptions = expiresIn ? { expiresIn } : {};

  const token = jwt.sign(payload, process.env.JWT_SIGNING_SECRET, options);
  await authTokenModel.create({
    token,
    user,
    ...(expiresIn
      ? { expiresAt: new Date(Date.now() + parseInt(expiresIn)) }
      : {}),
  });
  return token;
};

export const generateEmailVerificationToken = (
  email: string,
  password: string,
  name: string,
) => {
  if (!process.env.JWT_SIGNING_SECRET) {
    console.log(
      "JWT_SIGNING_SECRET is not defined in the environment variables",
    );
    throw AppError({
      message: "Token generation failed",
      statusCode: 500,
    });
  }

  const payload = {
    email,
    password,
    name,
  };

  return jwt.sign(payload, process.env.JWT_SIGNING_SECRET, {
    expiresIn: "10m",
  });
};

export const retrieveRegistrationTokenPayload = (token: string) => {
  if (!process.env.JWT_SIGNING_SECRET) {
    console.log(
      "JWT_SIGNING_SECRET is not defined in the environment variables",
    );
    throw AppError({
      message: "Token verification failed",
      statusCode: 500,
    });
  }

  return jwt.verify(token, process.env.JWT_SIGNING_SECRET);
};

export const generatePasswordResetToken = (email: string) => {
  if (!process.env.JWT_SIGNING_SECRET) {
    console.log(
      "JWT_SIGNING_SECRET is not defined in the environment variables",
    );
    throw AppError({
      message: "Token generation failed",
      statusCode: 500,
    });
  }

  const payload = {
    email,
  };

  return jwt.sign(payload, process.env.JWT_SIGNING_SECRET, {
    expiresIn: "10m",
  });
};

export const retrievePasswordResetTokenPayload = (token: string) => {
  if (!process.env.JWT_SIGNING_SECRET) {
    console.log(
      "JWT_SIGNING_SECRET is not defined in the environment variables",
    );
    throw AppError({
      message: "Token verification failed",
      statusCode: 500,
    });
  }

  return jwt.verify(token, process.env.JWT_SIGNING_SECRET);
};
