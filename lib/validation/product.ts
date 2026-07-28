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

  category: z.enum(["Women", "Men", "Pajamas", "Swimwear"]),

  availability: z.enum(["Available", "Low stock", "Ask staff"]),

  isVisible: z.boolean(),
});

export type AdminProductInfoInput = z.infer<
  typeof adminProductInfoSchema
>;