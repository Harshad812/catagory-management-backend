import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", createCategory);

router.get("/", getAllCategories);

router.put("/:id", updateCategory);

router.delete("/:id", deleteCategory);

export default router;
