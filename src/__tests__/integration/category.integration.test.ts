import "../setup";
import request from "supertest";
import express, { Application } from "express";
import categoryRoutes from "../../routes/category.routes";
import authRoutes from "../../routes/auth.routes";
import User from "../../models/User.model";
import Category from "../../models/Category.model";

const app: Application = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);

describe("Category Integration Tests", () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create and login a test user
    const user = await User.create({
      email: "categorytest@example.com",
      password: "password123",
      name: "Category Test User",
    });
    userId = user._id.toString();

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "categorytest@example.com",
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
  });

  describe("POST /api/category - Create Category", () => {
    it("should create a root category", async () => {
      const response = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Electronics",
          status: "active",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Electronics");
      expect(response.body.data.parent).toBeNull();
      expect(response.body.data.status).toBe("active");
    });

    it("should create a subcategory with parent", async () => {
      // Create parent
      const parentResponse = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Electronics" });

      const parentId = parentResponse.body.data._id;

      // Create child
      const childResponse = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Laptops",
          parent: parentId,
        });

      expect(childResponse.status).toBe(201);
      expect(childResponse.body.data.name).toBe("Laptops");
      expect(childResponse.body.data.parent).toBe(parentId);
    });

    it("should require authentication", async () => {
      const response = await request(app).post("/api/category").send({
        name: "Test Category",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should validate category name", async () => {
      const response = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          status: "active",
          // Missing name
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 404 for non-existent parent", async () => {
      const response = await request(app)
        .post("/api/category")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          name: "Test",
          parent: "507f1f77bcf86cd799439011", // Non-existent ID
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Parent category not found");
    });
  });

  describe("GET /api/category - Get All Categories", () => {
    it("should return empty tree when no categories exist", async () => {
      const response = await request(app)
        .get("/api/category")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it("should return categories in tree structure", async () => {
      // Create hierarchy
      const electronics = await Category.create({ name: "Electronics" });
      const computers = await Category.create({
        name: "Computers",
        parent: electronics._id,
      });
      const laptops = await Category.create({
        name: "Laptops",
        parent: computers._id,
      });

      const response = await request(app)
        .get("/api/category")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.total).toBe(3);
      expect(response.body.data.length).toBe(1); // One root category

      const root = response.body.data[0];
      expect(root.name).toBe("Electronics");
      expect(root.children.length).toBe(1);
      expect(root.children[0].name).toBe("Computers");
      expect(root.children[0].children[0].name).toBe("Laptops");
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/category");

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/category/:id - Update Category", () => {
    it("should update category name", async () => {
      const category = await Category.create({ name: "Old Name" });

      const response = await request(app)
        .put(`/api/category/${category._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "New Name" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("New Name");
    });

    it("should update category status and cascade to children", async () => {
      // Create hierarchy
      const parent = await Category.create({ name: "Parent" });
      const child1 = await Category.create({
        name: "Child 1",
        parent: parent._id,
      });
      const child2 = await Category.create({
        name: "Child 2",
        parent: parent._id,
      });
      const grandchild = await Category.create({
        name: "Grandchild",
        parent: child1._id,
      });

      // Update parent to inactive
      const response = await request(app)
        .put(`/api/category/${parent._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ status: "inactive" });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe("inactive");

      // Check all descendants are inactive
      const updatedChild1 = await Category.findById(child1._id);
      const updatedChild2 = await Category.findById(child2._id);
      const updatedGrandchild = await Category.findById(grandchild._id);

      expect(updatedChild1?.status).toBe("inactive");
      expect(updatedChild2?.status).toBe("inactive");
      expect(updatedGrandchild?.status).toBe("inactive");
    });

    it("should return 404 for non-existent category", async () => {
      const response = await request(app)
        .put("/api/category/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "Test" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /api/category/:id - Delete Category", () => {
    it("should delete category and reassign children to parent", async () => {
      // Create hierarchy: Grandparent -> Parent -> Children
      const grandparent = await Category.create({ name: "Grandparent" });
      const parent = await Category.create({
        name: "Parent",
        parent: grandparent._id,
      });
      const child1 = await Category.create({
        name: "Child 1",
        parent: parent._id,
      });
      const child2 = await Category.create({
        name: "Child 2",
        parent: parent._id,
      });

      // Delete parent
      const response = await request(app)
        .delete(`/api/category/${parent._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify parent is deleted
      const deletedParent = await Category.findById(parent._id);
      expect(deletedParent).toBeNull();

      // Verify children are reassigned to grandparent
      const updatedChild1 = await Category.findById(child1._id);
      const updatedChild2 = await Category.findById(child2._id);

      expect(updatedChild1?.parent?.toString()).toBe(
        grandparent._id.toString()
      );
      expect(updatedChild2?.parent?.toString()).toBe(
        grandparent._id.toString()
      );
    });

    it("should delete root category and make children root categories", async () => {
      const parent = await Category.create({ name: "Parent" });
      const child = await Category.create({
        name: "Child",
        parent: parent._id,
      });

      await request(app)
        .delete(`/api/category/${parent._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      const updatedChild = await Category.findById(child._id);
      expect(updatedChild?.parent).toBeNull();
    });

    it("should return 404 for non-existent category", async () => {
      const response = await request(app)
        .delete("/api/category/507f1f77bcf86cd799439011")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Authentication Requirements", () => {
    it("should reject requests with invalid token", async () => {
      const response = await request(app)
        .get("/api/category")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
    });

    it("should reject requests without Bearer prefix", async () => {
      const response = await request(app)
        .get("/api/category")
        .set("Authorization", authToken);

      expect(response.status).toBe(401);
    });
  });
});
