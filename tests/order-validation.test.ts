import { describe, expect, it } from "vitest";
import {
  createOrderRequestSchema,
  getOrderFieldErrors,
} from "@/lib/validation/order";

const validOrder = {
  requestToken: "018f1f89-4eb7-7f35-8ac1-4a689d73303c",
  customer: {
    name: "  June Customer  ",
    phone: "  +95 9 123 456 789  ",
    preferredContact: "Phone" as const,
    note: "  Please call first.  ",
  },
  fulfillment: {
    method: "delivery" as const,
    address: "  Yangon  ",
  },
  privacyAcknowledged: true,
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
      preferredContact: "Phone",
      note: "Please call first.",
    });
    expect(result.fulfillment).toEqual({
      method: "delivery",
      address: "Yangon",
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

  it("rejects an order without privacy acknowledgement", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      privacyAcknowledged: false,
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid order request token", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      requestToken: "not-a-token",
    });

    expect(result.success).toBe(false);
  });

  it("requires an address for delivery", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      fulfillment: { method: "delivery", address: "" },
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getOrderFieldErrors(result.error)).toEqual({
        address: "Delivery address is required.",
      });
    }
  });

  it("accepts a positive store ID for pickup", () => {
    const result = createOrderRequestSchema.parse({
      ...validOrder,
      fulfillment: { method: "pickup", storeId: 3 },
    });

    expect(result.fulfillment).toEqual({ method: "pickup", storeId: 3 });
  });

  it("requires a valid store for pickup", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      fulfillment: { method: "pickup", storeId: 0 },
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getOrderFieldErrors(result.error)).toEqual({
        pickupStoreId: "Choose a pickup store.",
      });
    }
  });

  it("maps customer validation issues to checkout fields", () => {
    const result = createOrderRequestSchema.safeParse({
      ...validOrder,
      customer: {
        ...validOrder.customer,
        name: "",
        phone: "123",
      },
      privacyAcknowledged: false,
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(getOrderFieldErrors(result.error)).toEqual({
        name: "Name is required.",
        phone: "Enter a valid phone number.",
        privacyAcknowledged:
          "Read and acknowledge the privacy notice before continuing.",
      });
    }
  });
});
