import { describe, expect, it } from "vitest";
import { createOrderRequestSchema } from "@/lib/validation/order";

const validOrder = {
  customer: {
    name: "  June Customer  ",
    phone: "  +95 9 123 456 789  ",
    address: "  Yangon  ",
    preferredContact: "Phone" as const,
    note: "  Please call first.  ",
  },
  items: [
    {
      variantId: 12,
      quantity: 2,
    },
  ],
};

describe("createOrderRequestSchema", () => {
  it("normalizes valid customer fields", () => {
    const result = createOrderRequestSchema.parse(validOrder);

    expect(result.customer).toEqual({
      name: "June Customer",
      phone: "+95 9 123 456 789",
      address: "Yangon",
      preferredContact: "Phone",
      note: "Please call first.",
    });
  });

  it.each(["123456", "1234567890123456", "not-a-phone"])(
    "rejects an invalid phone number: %s",
    (phone) => {
      const result = createOrderRequestSchema.safeParse({
        ...validOrder,
        customer: { ...validOrder.customer, phone },
      });

      expect(result.success).toBe(false);
    },
  );

  it.each([0, 21, 1.5])("rejects unsafe item quantity: %s", (quantity) => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      items: [{ variantId: 12, quantity }],
    });

    expect(result.success).toBe(false);
  });

  it("rejects client product snapshots instead of a valid variant ID", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      items: [
        {
          variantId: 0,
          productId: 1,
          priceMMK: 1,
          quantity: 1,
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
