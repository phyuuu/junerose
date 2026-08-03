import { z } from "zod";

export const customerContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  phone: z.string().trim().min(1, "Phone is required."),
  address: z.string().trim().min(1, "Address is required."),
  preferredContact: z.enum(["Viber", "Messenger", "Phone"]),
  note: z.string().trim().optional(),
});

export const orderCartItemSchema = z.object({
  productId: z.number().int().positive(),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  priceMMK: z.number().int().nonnegative(),
  image: z.string().trim().min(1),
  selectedSize: z.string().trim().min(1),
  selectedColor: z.string().trim().min(1),
  quantity: z.number().int().positive(),
});

export const createOrderRequestSchema = z.object({
  customer: customerContactSchema,
  items: z.array(orderCartItemSchema).min(1, "Add at least one item."),
});

export type CreateOrderRequestInput = z.infer<
  typeof createOrderRequestSchema
>;
