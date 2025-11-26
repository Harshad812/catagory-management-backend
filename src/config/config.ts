import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongoUrl: string;
  jwtSecret: string;
}

const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUrl: process.env.MONGODB_URL || "",
  jwtSecret: process.env.JWT_SECRET || "",
};

export default config;
