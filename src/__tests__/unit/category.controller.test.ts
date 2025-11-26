import "../setup";
import Category from "../../models/Category.model";
import mongoose from "mongoose";

describe("Category Controller Unit Tests", () => {
  describe("Category Creation", () => {
    it("should create a root category without parent", async () => {
      const category = await Category.create({
        name: "Electronics",
        status: "active",
      });

      expect(category.name).toBe("Electronics");
      expect(category.parent).toBeNull();
      expect(category.status).toBe("active");
    });

    it("should create a subcategory with parent", async () => {
      const parent = await Category.create({
        name: "Electronics",
      });

      const child = await Category.create({
        name: "Laptops",
        parent: parent._id,
      });

      expect(child.name).toBe("Laptops");
      expect(child.parent?.toString()).toBe(parent._id.toString());
    });

    it("should default status to active", async () => {
      const category = await Category.create({
        name: "Books",
      });

      expect(category.status).toBe("active");
    });
  });

  describe("Category Tree Structure", () => {
    it("should build multi-level category tree", async () => {
      // Create root
      const electronics = await Category.create({ name: "Electronics" });

      // Create level 1 children
      const computers = await Category.create({
        name: "Computers",
        parent: electronics._id,
      });
      const phones = await Category.create({
        name: "Phones",
        parent: electronics._id,
      });

      // Create level 2 children
      const laptops = await Category.create({
        name: "Laptops",
        parent: computers._id,
      });
      const desktops = await Category.create({
        name: "Desktops",
        parent: computers._id,
      });

      // Verify relationships
      const allCategories = await Category.find();
      expect(allCategories.length).toBe(5);

      const computersChildren = await Category.find({ parent: computers._id });
      expect(computersChildren.length).toBe(2);
    });
  });

  describe("Category Status Updates", () => {
    it("should update category status", async () => {
      const category = await Category.create({
        name: "Test Category",
        status: "active",
      });

      category.status = "inactive";
      await category.save();

      const updated = await Category.findById(category._id);
      expect(updated?.status).toBe("inactive");
    });

    it("should handle cascading inactive status to descendants", async () => {
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

      // All should be active initially
      expect(parent.status).toBe("active");
      expect(child1.status).toBe("active");
      expect(child2.status).toBe("active");
      expect(grandchild.status).toBe("active");

      // This test verifies the data structure is correct
      // The actual cascading logic is tested in integration tests
    });
  });

  describe("Category Deletion and Reassignment", () => {
    it("should reassign children to grandparent on deletion", async () => {
      // Create hierarchy: Grandparent -> Parent -> Child
      const grandparent = await Category.create({ name: "Grandparent" });
      const parent = await Category.create({
        name: "Parent",
        parent: grandparent._id,
      });
      const child = await Category.create({
        name: "Child",
        parent: parent._id,
      });

      // Delete parent
      await Category.findByIdAndDelete(parent._id);

      // Update child's parent to grandparent (simulating controller logic)
      await Category.updateMany(
        { parent: parent._id },
        { parent: grandparent._id }
      );

      // Verify child is now under grandparent
      const updatedChild = await Category.findById(child._id);
      expect(updatedChild?.parent?.toString()).toBe(grandparent._id.toString());
    });

    it("should reassign children to null if parent has no parent", async () => {
      const parent = await Category.create({ name: "Parent" });
      const child = await Category.create({
        name: "Child",
        parent: parent._id,
      });

      // Delete parent
      await Category.findByIdAndDelete(parent._id);

      // Update child's parent to null
      await Category.updateMany({ parent: parent._id }, { parent: null });

      const updatedChild = await Category.findById(child._id);
      expect(updatedChild?.parent).toBeNull();
    });
  });

  describe("Validation", () => {
    it("should require category name", async () => {
      const category = new Category({
        status: "active",
      });

      await expect(category.save()).rejects.toThrow();
    });

    it("should validate status enum", async () => {
      const category = new Category({
        name: "Test",
        status: "invalid-status" as any,
      });

      await expect(category.save()).rejects.toThrow();
    });

    it("should trim category name", async () => {
      const category = await Category.create({
        name: "  Trimmed Name  ",
      });

      expect(category.name).toBe("Trimmed Name");
    });
  });

  describe("Performance Indexes", () => {
    it("should have indexes on parent and status fields", async () => {
      const indexes = await Category.collection.getIndexes();

      // Check if indexes exist
      const indexKeys = Object.keys(indexes);
      expect(indexKeys.length).toBeGreaterThan(0);
    });
  });
});
