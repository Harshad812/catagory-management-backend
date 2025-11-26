import Joi from "joi";
import mongoose from "mongoose";

export const createCategorySchema = Joi.object({
  name: Joi.string().required().trim().messages({
    "string.empty": "Category name is required",
    "any.required": "Category name is required",
  }),
  parent: Joi.string()
    .optional()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid parent ID",
    }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "any.only": "Status must be either active or inactive",
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().optional().trim().min(1).messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name cannot be empty",
  }),
  status: Joi.string().valid("active", "inactive").optional().messages({
    "any.only": "Status must be either active or inactive",
  }),
});
