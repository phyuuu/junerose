import { z } from "zod";

export const storefrontContentSchema = z.object({
  heroTitle: z
    .string()
    .trim()
    .min(3, "Hero title must be at least 3 characters.")
    .max(120, "Hero title must be 120 characters or fewer."),
  heroDescription: z
    .string()
    .trim()
    .min(3, "Hero description must be at least 3 characters.")
    .max(240, "Hero description must be 240 characters or fewer."),
});

export function validateStorefrontContent(formData: FormData) {
  return storefrontContentSchema.safeParse({
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroDescription: String(formData.get("heroDescription") ?? ""),
  });
}
