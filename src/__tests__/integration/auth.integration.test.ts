import "../setup";
import request from "supertest";
import express, { Application } from "express";
import authRoutes from "../../routes/auth.routes";
import User from "../../models/User.model";

const app: Application = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("newuser@example.com");
      expect(response.body.data.user.name).toBe("New User");
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    it("should not register user with duplicate email", async () => {
      // Create first user
      await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
        name: "First User",
      });

      // Try to register with same email
      const response = await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password456",
        name: "Second User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("already exists");
    });

    it("should validate email format", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate password length", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "123", // Too short
        name: "Test User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should require all fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        // Missing password and name
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        email: "login@example.com",
        password: "password123",
        name: "Login User",
      });
    });

    it("should login with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("login@example.com");
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with incorrect password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Invalid");
    });

    it("should not login with non-existent email", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format on login", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("JWT Token Validation", () => {
    it("should return a valid JWT token structure", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "jwt@example.com",
        password: "password123",
        name: "JWT User",
      });

      const token = response.body.data.token;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });
  });
});
