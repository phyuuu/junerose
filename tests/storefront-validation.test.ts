import { describe, expect, it } from "vitest";
import { storefrontContentSchema } from "@/lib/validation/storefront";

describe("storefrontContentSchema", () => {
  it("trims valid storefront copy", () => {
    const result = storefrontContentSchema.parse({
      heroTitle: "  Everyday comfort  ",
      heroDescription: "  Pieces selected with care.  ",
    });

    expect(result).toEqual({
      heroTitle: "Everyday comfort",
      heroDescription: "Pieces selected with care.",
    });
  });

  it("rejects empty storefront copy", () => {
    const result = storefrontContentSchema.safeParse({
      heroTitle: "  ",
      heroDescription: "  ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects copy beyond the database limits", () => {
    const result = storefrontContentSchema.safeParse({
      heroTitle: "T".repeat(121),
      heroDescription: "D".repeat(241),
    });

    expect(result.success).toBe(false);
  });
});
