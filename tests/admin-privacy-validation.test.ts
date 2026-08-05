import { describe, expect, it } from "vitest";
import { validateAdminPrivacyOrderVerification } from "@/lib/validation/admin-privacy";

describe("admin privacy order verification", () => {
  it("trims surrounding whitespace without changing supplied details", () => {
    expect(
      validateAdminPrivacyOrderVerification(
        "  JR-20260803-9746  ",
        "  09 123 456 789  ",
      ),
    ).toEqual({
      data: {
        orderNumber: "JR-20260803-9746",
        customerPhone: "09 123 456 789",
      },
    });
  });

  it("rejects a missing order number", () => {
    expect(validateAdminPrivacyOrderVerification("", "09123456789")).toEqual({
      error: "Enter a valid order number.",
    });
  });

  it("rejects a phone number outside the normalized length limits", () => {
    expect(validateAdminPrivacyOrderVerification("JR-1", "123")).toEqual({
      error: "Enter the phone number used for this order.",
    });
  });
});
