import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  parent?: mongoose.Types.ObjectId | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ parent: 1, status: 1 });

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
