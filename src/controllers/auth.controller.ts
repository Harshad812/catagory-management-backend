import { Request, Response } from "express";
import User from "../models/User.model";
import { generateToken } from "../utils/auth.utils";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../utils/response.utils";
import { registerSchema, loginSchema } from "../validations/auth.validation";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      sendValidationError(
        res,
        error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        }))
      );
      return;
    }

    const { email, password, name } = value;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 400, "User with this email already exists");
      return;
    }

    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    const token = generateToken(user._id.toString());

    sendSuccess(res, 201, "User registered successfully", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    sendError(res, 500, "Server error during registration", error.message);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      sendValidationError(
        res,
        error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        }))
      );
      return;
    }

    const { email, password } = value;

    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 401, "Invalid email or password");
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      sendError(res, 401, "Invalid email or password");
      return;
    }

    const token = generateToken(user._id.toString());

    sendSuccess(res, 200, "Login successful", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    sendError(res, 500, "Server error during login", error.message);
  }
};
