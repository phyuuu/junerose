import { z } from "zod";

export const adminProductInfoSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Product name is required.")
    .max(120, "Product name must be 120 characters or fewer."),

  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(2000, "Description must be 2000 characters or fewer."),

  priceMMK: z
    .number()
    .int("Price must be a whole number.")
    .nonnegative("Price cannot be negative."),

  departmentId: z
    .number()
    .int("Select a valid department.")
    .positive("Select a department."),

  productTypeId: z
    .number()
    .int("Select a valid product type.")
    .positive("Select a product type."),

  materialIds: z
    .array(z.number().int().positive())
    .max(20, "Select no more than 20 materials."),

  availability: z.enum(["Available", "Low stock", "Ask staff"]),

  isVisible: z.boolean(),
});

export type AdminProductInfoInput = z.infer<
  typeof adminProductInfoSchema
>;

export const adminProductVariantSchema = z.object({
  sizeId: z
    .number()
    .int("Select a valid size.")
    .positive("Select a size."),

  colorId: z
    .number()
    .int("Select a valid color.")
    .positive("Select a color."),

  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .nonnegative("Initial quantity cannot be negative."),
});

export const adminCreateProductBaseSchema = adminProductInfoSchema.extend({
  code: z
    .string()
    .trim()
    .min(1, "Product code is required.")
    .max(50, "Product code must be 50 characters or fewer."),

  slug: z
    .string()
    .trim()
    .min(1, "Product slug is required.")
    .max(120, "Product slug must be 120 characters or fewer.")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens.",
    ),
});

export const adminCreateProductSchema = adminCreateProductBaseSchema.extend({
  variants: z
    .array(adminProductVariantSchema)
    .min(1, "Add at least one product variant.")
});

export type AdminProductVariantInput = z.infer<
  typeof adminProductVariantSchema
>;

export type AdminCreateProductInput = z.infer<
  typeof adminCreateProductSchema
>;
