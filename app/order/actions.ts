"use server";

import { createClient } from "@/lib/supabase/server";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";
import {
  createOrderRequestSchema,
  getOrderFieldErrors,
  type OrderFieldErrors,
} from "@/lib/validation/order";
import { z } from "zod";

type CreateOrderRequestResult =
  | {
      ok: true;
      orderNumber: string;
    }
  | {
      ok: false;
      error: string;
      code?: "cart_changed";
      fieldErrors?: OrderFieldErrors;
    };

const createOrderResponseSchema = z.object({
  order_number: z.string().min(1),
});

export async function createOrderRequestAction(
  input: unknown,
): Promise<CreateOrderRequestResult> {
  const parsed = createOrderRequestSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = getOrderFieldErrors(parsed.error);
    const cartIssue = parsed.error.issues.some(
      (issue) => issue.path[0] === "items",
    );
    const requestTokenIssue = parsed.error.issues.some(
      (issue) => issue.path[0] === "requestToken",
    );

    return {
      ok: false,
      code: cartIssue ? "cart_changed" : undefined,
      fieldErrors,
      error: requestTokenIssue
        ? "Refresh the checkout page and try again."
        : cartIssue
          ? "Your shopping bag contains invalid items. Return to the bag and review it."
          : "Check the highlighted order details and try again.",
    };
  }

  const { customer, items, requestToken } = parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_order_request", {
    order_customer_name: customer.name,
    order_customer_phone: customer.phone,
    order_customer_address: customer.address,
    order_preferred_contact: customer.preferredContact,
    order_customer_note: customer.note ?? null,
    order_request_token: requestToken,
    order_items: items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
  });

  if (error || !data) {
    if (error?.message === "Too many order requests for this phone number.") {
      return {
        ok: false,
        error:
          "Too many recent order requests. Please wait before trying again or contact JuneRose staff.",
      };
    }

    if (
      error?.message ===
        "One or more selected products are no longer available." ||
      error?.message ===
        "One or more selected products do not have enough stock."
    ) {
      return {
        ok: false,
        code: "cart_changed",
        error:
          "Your shopping bag changed while you were ordering. Review the highlighted items and try again.",
      };
    }

    const referenceId = reportServerError({
      operation: "customer.order.create",
      error: error ?? new Error("Order creation returned no data"),
    });

    return {
      ok: false,
      error: withErrorReference(
        "Unable to send order request. Please try again.",
        referenceId,
      ),
    };
  }

  const createdOrder = createOrderResponseSchema.safeParse(data);

  if (!createdOrder.success) {
    const referenceId = reportServerError({
      operation: "customer.order.parse_response",
      error: createdOrder.error,
    });

    return {
      ok: false,
      error: withErrorReference(
        "Unable to send order request. Please try again.",
        referenceId,
      ),
    };
  }

  return {
    ok: true,
    orderNumber: createdOrder.data.order_number,
  };
}
