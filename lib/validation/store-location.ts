import { z } from "zod";

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "Phone must be 30 characters or fewer.")
  .refine((phone) => {
    if (!phone) return true;

    const digitCount = phone.replace(/[^0-9]/g, "").length;
    return digitCount >= 7 && digitCount <= 15;
  }, "Enter a valid phone number.");

const optionalMapUrlSchema = z
  .string()
  .trim()
  .max(500, "Map link must be 500 characters or fewer.")
  .refine((value) => {
    if (!value) return true;

    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a complete HTTPS map link.");

export const storeLocationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Store name is required.")
    .max(120, "Store name must be 120 characters or fewer."),
  township: z
    .string()
    .trim()
    .min(1, "Township is required.")
    .max(120, "Township must be 120 characters or fewer."),
  address: z
    .string()
    .trim()
    .min(1, "Address is required.")
    .max(500, "Address must be 500 characters or fewer."),
  phone: optionalPhoneSchema,
  openingHours: z
    .string()
    .trim()
    .max(300, "Opening hours must be 300 characters or fewer."),
  mapUrl: optionalMapUrlSchema,
  displayOrder: z.number().int().min(0, "Display order cannot be negative."),
  isActive: z.boolean(),
});

export type StoreLocationInput = z.infer<typeof storeLocationSchema>;

export function validateStoreLocationForm(formData: FormData) {
  const displayOrderValue = String(formData.get("displayOrder") ?? "").trim();

  return storeLocationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    township: String(formData.get("township") ?? ""),
    address: String(formData.get("address") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    openingHours: String(formData.get("openingHours") ?? ""),
    mapUrl: String(formData.get("mapUrl") ?? ""),
    displayOrder: displayOrderValue ? Number(displayOrderValue) : 0,
    isActive: formData.get("isActive") === "on",
  });
}
