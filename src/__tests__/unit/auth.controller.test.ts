import "../setup";
import User from "../../models/User.model";
import { generateToken } from "../../utils/auth.utils";

describe("Auth Controller Unit Tests", () => {
  describe("User Registration", () => {
    it("should create a new user with hashed password", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const user = new User(userData);
      await user.save();

      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.password).not.toBe(userData.password); // Password should be hashed
      expect(user.password.length).toBeGreaterThan(20); // Hashed password is longer
    });

    it("should not allow duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "password123",
        name: "User One",
      };

      await User.create(userData);

      // Try to create another user with same email
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it("should validate email format", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
        name: "Test User",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require password with minimum length", async () => {
      const userData = {
        email: "test@example.com",
        password: "123", // Too short
        name: "Test User",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("User Login", () => {
    it("should correctly compare passwords", async () => {
      const password = "mySecurePassword123";
      const user = await User.create({
        email: "login@example.com",
        password,
        name: "Login User",
      });

      const isMatch = await user.comparePassword(password);
      expect(isMatch).toBe(true);

      const isWrongMatch = await user.comparePassword("wrongPassword");
      expect(isWrongMatch).toBe(false);
    });
  });

  describe("JWT Token Generation", () => {
    it("should generate a valid JWT token", async () => {
      const user = await User.create({
        email: "jwt@example.com",
        password: "password123",
        name: "JWT User",
      });

      const token = generateToken(user._id.toString());
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });
  });

  describe("Error Handling", () => {
    it("should handle missing required fields", async () => {
      const user = new User({
        email: "incomplete@example.com",
        // Missing password and name
      });

      await expect(user.save()).rejects.toThrow();
    });

    it("should trim and lowercase email", async () => {
      const user = await User.create({
        email: "  UPPERCASE@EXAMPLE.COM  ",
        password: "password123",
        name: "Trim Test",
      });

      expect(user.email).toBe("uppercase@example.com");
    });
  });
});
