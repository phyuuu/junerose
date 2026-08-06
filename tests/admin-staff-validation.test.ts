import { describe, expect, it } from "vitest";
import {
  validateStaffDisplayName,
  validateStaffEmail,
} from "@/lib/validation/admin-staff";

describe("admin staff validation", () => {
  it("normalizes a valid staff email", () => {
    expect(validateStaffEmail("  STAFF@Example.com  ")).toEqual({
      email: "staff@example.com",
    });
  });

  it("rejects an invalid email", () => {
    expect(validateStaffEmail("not-an-email")).toEqual({
      error: "Enter a valid email address.",
    });
  });

  it("rejects a missing email", () => {
    expect(validateStaffEmail(null)).toEqual({
      error: "Enter the staff member's email address.",
    });
  });

  it("normalizes a staff display name", () => {
    expect(validateStaffDisplayName("  May Thu  ")).toEqual({
      displayName: "May Thu",
    });
  });

  it("rejects a missing staff display name", () => {
    expect(validateStaffDisplayName(null)).toEqual({
      error: "Enter the staff member's display name.",
    });
  });
});
