import { Request, Response } from "express";
import Category, { ICategory } from "../models/Category.model";
import mongoose from "mongoose";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../utils/response.utils";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/category.validation";

const buildCategoryTree = (
  categories: ICategory[],
  parentId: mongoose.Types.ObjectId | null = null
): any[] => {
  const tree: any[] = [];

  categories.forEach((category) => {
    const categoryParentId = category.parent
      ? category.parent.toString()
      : null;
    const compareParentId = parentId ? parentId.toString() : null;

    if (categoryParentId === compareParentId) {
      const children = buildCategoryTree(categories, category._id);
      const categoryObj = {
        id: category._id,
        name: category.name,
        status: category.status,
        parent: category.parent,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
        children: children.length > 0 ? children : [],
      };
      tree.push(categoryObj);
    }
  });

  return tree;
};

const getAllDescendantIds = async (
  categoryId: mongoose.Types.ObjectId
): Promise<mongoose.Types.ObjectId[]> => {
  const descendants: mongoose.Types.ObjectId[] = [];
  const children = await Category.find({ parent: categoryId });

  for (const child of children) {
    descendants.push(child._id);
    const childDescendants = await getAllDescendantIds(child._id);
    descendants.push(...childDescendants);
  }

  return descendants;
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = createCategorySchema.validate(req.body, {
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

    const { name, parent, status } = value;

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        sendError(res, 404, "Parent category not found");
        return;
      }
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      sendError(res, 400, "Category with this name already exists");
      return;
    }

    const category = new Category({
      name,
      parent: parent || null,
      status: status || "active",
    });

    await category.save();

    sendSuccess(res, 201, "Category created successfully", category);
  } catch (error: any) {
    console.error("Create category error:", error);
    sendError(res, 500, "Server error while creating category", error.message);
  }
};

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    const tree = buildCategoryTree(categories);

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: tree,
      total: categories.length,
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    sendError(
      res,
      500,
      "Server error while fetching categories",
      error.message
    );
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = updateCategorySchema.validate(req.body, {
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

    const { id } = req.params;
    const { name, status } = value;

    const category = await Category.findById(id);
    if (!category) {
      sendError(res, 404, "Category not found");
      return;
    }

    if (name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory && existingCategory._id.toString() !== id) {
        sendError(res, 400, "Category with this name already exists");
        return;
      }
      category.name = name;
    }

    if (status && status !== category.status) {
      category.status = status;

      if (status === "inactive") {
        const descendantIds = await getAllDescendantIds(category._id);
        if (descendantIds.length > 0) {
          await Category.updateMany(
            { _id: { $in: descendantIds } },
            { status: "inactive" }
          );
        }
      }
    }

    await category.save();

    sendSuccess(res, 200, "Category updated successfully", category);
  } catch (error: any) {
    console.error("Update category error:", error);
    sendError(res, 500, "Server error while updating category", error.message);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      sendError(res, 404, "Category not found");
      return;
    }

    await Category.updateMany(
      { parent: category._id },
      { parent: category.parent }
    );

    await Category.findByIdAndDelete(id);

    sendSuccess(
      res,
      200,
      "Category deleted successfully. Children reassigned to parent.",
      { deletedCategory: category }
    );
  } catch (error: any) {
    console.error("Delete category error:", error);
    sendError(res, 500, "Server error while deleting category", error.message);
  }
};
