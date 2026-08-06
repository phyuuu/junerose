import { z } from "zod";

const staffEmailSchema = z
  .string()
  .trim()
  .min(1, "Enter the staff member's email address.")
  .max(254, "Email address is too long.")
  .email("Enter a valid email address.");

const staffDisplayNameSchema = z
  .string()
  .trim()
  .min(1, "Enter the staff member's display name.")
  .max(80, "Display name must be 80 characters or fewer.")
  .refine(
    (value) =>
      Array.from(value).every((character) => {
        const code = character.charCodeAt(0);
        return code >= 32 && code !== 127;
      }),
    "Display name contains unsupported characters.",
  );

export function validateStaffEmail(value: FormDataEntryValue | null) {
  const result = staffEmailSchema.safeParse(String(value ?? ""));

  if (!result.success) {
    return {
      error: result.error.issues[0]?.message ?? "Enter a valid email address.",
    };
  }

  return { email: result.data.toLowerCase() };
}

export function validateStaffDisplayName(
  value: FormDataEntryValue | null,
) {
  const result = staffDisplayNameSchema.safeParse(String(value ?? ""));

  if (!result.success) {
    return {
      error:
        result.error.issues[0]?.message ??
        "Enter a valid staff display name.",
    };
  }

  return { displayName: result.data };
}
