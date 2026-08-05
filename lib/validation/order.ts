import { z } from "zod";

export const customerContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must be 120 characters or fewer."),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required.")
    .max(30, "Phone must be 30 characters or fewer.")
    .refine(
      (phone) => {
        const digitCount = phone.replace(/[^0-9]/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
      },
      "Enter a valid phone number.",
    ),
  address: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(500, "Address must be 500 characters or fewer."),
  preferredContact: z.enum(["Viber", "Messenger", "Phone"]),
  note: z
    .string()
    .trim()
    .max(1000, "Note must be 1000 characters or fewer.")
    .optional(),
});

export const orderCartItemSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive().max(20),
});

export const createOrderRequestSchema = z.object({
  customer: customerContactSchema,
  privacyAcknowledged: z.boolean().refine((value) => value, {
    message: "Read and acknowledge the privacy notice before continuing.",
  }),
  items: z
    .array(orderCartItemSchema)
    .min(1, "Add at least one item.")
    .max(50, "An order can contain at most 50 items."),
});

export type CreateOrderRequestInput = z.infer<
  typeof createOrderRequestSchema
>;
