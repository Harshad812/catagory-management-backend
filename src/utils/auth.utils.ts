import jwt from "jsonwebtoken";
import config from "../config/config";

export interface JWTPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  const payload: JWTPayload = { userId };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: "7d", // Token expires in 7 days
  });
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
