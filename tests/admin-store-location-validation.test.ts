import { describe, expect, it } from "vitest";
import { storeLocationSchema } from "@/lib/validation/store-location";

const validLocation = {
  name: "JuneRose Hledan",
  township: "Kamayut",
  address: "Example address, Yangon",
  phone: "+95 9 123 456 789",
  openingHours: "Daily, 9:00 AM to 7:00 PM",
  mapUrl: "https://maps.google.com/example",
  displayOrder: 0,
  isActive: true,
};

describe("storeLocationSchema", () => {
  it("normalizes valid store information", () => {
    const result = storeLocationSchema.parse({
      ...validLocation,
      name: "  JuneRose Hledan  ",
      township: "  Kamayut  ",
    });

    expect(result.name).toBe("JuneRose Hledan");
    expect(result.township).toBe("Kamayut");
  });

  it("requires a name, township, and address", () => {
    const result = storeLocationSchema.safeParse({
      ...validLocation,
      name: "",
      township: "",
      address: "",
    });

    expect(result.success).toBe(false);
  });

  it("allows optional contact information to be empty", () => {
    const result = storeLocationSchema.safeParse({
      ...validLocation,
      phone: "",
      openingHours: "",
      mapUrl: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid phone numbers and non-HTTPS map links", () => {
    expect(
      storeLocationSchema.safeParse({ ...validLocation, phone: "123" }).success,
    ).toBe(false);
    expect(
      storeLocationSchema.safeParse({
        ...validLocation,
        mapUrl: "http://example.com",
      }).success,
    ).toBe(false);
  });

  it("rejects a negative display order", () => {
    const result = storeLocationSchema.safeParse({
      ...validLocation,
      displayOrder: -1,
    });

    expect(result.success).toBe(false);
  });
});
