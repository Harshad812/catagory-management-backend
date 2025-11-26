import { Response } from "express";

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
  error?: string;
}

export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): void => {
  const response: ApiResponse = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
  };

  if (error) {
    response.error = error;
  }

  res.status(statusCode).json(response);
};

export const sendValidationError = (
  res: Response,
  errors: Array<{ field: string | number; message: string }>
): void => {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};
