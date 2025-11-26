import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils";
import User from "../models/User.model";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
      return;
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token. Authorization denied.",
      });
      return;
    }

    // Check if user exists
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found. Authorization denied.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication",
    });
  }
};
