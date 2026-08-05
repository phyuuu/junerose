"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";
import { createClient } from "@/lib/supabase/server";
import { validateAdminPrivacyOrderVerification } from "@/lib/validation/admin-privacy";
import type {
  AdminPrivacyOrderPreview,
  AdminPrivacyRequestState,
} from "@/types/admin-privacy";
import type { OrderStatus } from "@/types/order";

type PrivacyOrderResponse = {
  order_number?: unknown;
  customer_name?: unknown;
  customer_phone?: unknown;
  status?: unknown;
  created_at?: unknown;
  can_anonymize?: unknown;
};

const CLOSED_ORDER_STATUSES: OrderStatus[] = ["completed", "cancelled"];

function parsePrivacyOrderResponse(
  value: unknown,
): AdminPrivacyOrderPreview | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const order = value as PrivacyOrderResponse;

  if (
    typeof order.order_number !== "string" ||
    typeof order.customer_name !== "string" ||
    typeof order.customer_phone !== "string" ||
    typeof order.status !== "string" ||
    !CLOSED_ORDER_STATUSES.concat([
      "pending",
      "confirmed",
      "preparing",
      "ready",
    ]).includes(order.status as OrderStatus) ||
    typeof order.created_at !== "string" ||
    typeof order.can_anonymize !== "boolean"
  ) {
    return null;
  }

  return {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    canAnonymize: order.can_anonymize,
  };
}

async function loadPrivacyOrder(
  orderNumber: string,
  customerPhone: string,
): Promise<AdminPrivacyRequestState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_privacy_request", {
    lookup_order_number: orderNumber,
    lookup_customer_phone: customerPhone,
  });

  if (error) {
    const referenceId = reportServerError({
      operation: "admin.privacy_request.lookup",
      error,
    });

    return {
      error: withErrorReference(
        "Unable to verify the order privacy request.",
        referenceId,
      ),
    };
  }

  if (data === null) {
    return {
      error: "No order matched that order number and phone number.",
    };
  }

  const preview = parsePrivacyOrderResponse(data);

  if (!preview) {
    const referenceId = reportServerError({
      operation: "admin.privacy_request.parse_lookup",
      error: new Error("Unexpected privacy order response"),
    });

    return {
      error: withErrorReference(
        "Unable to verify the order privacy request.",
        referenceId,
      ),
    };
  }

  return {
    preview,
    verification: {
      orderNumber,
      customerPhone,
    },
  };
}

export async function manageOrderPrivacyRequestAction(
  _previousState: AdminPrivacyRequestState,
  formData: FormData,
): Promise<AdminPrivacyRequestState> {
  await requireAdmin();

  const verificationResult = validateAdminPrivacyOrderVerification(
    formData.get("orderNumber"),
    formData.get("customerPhone"),
  );

  if (!verificationResult.data) {
    return { error: verificationResult.error };
  }

  const { orderNumber, customerPhone } = verificationResult.data;
  const intent = String(formData.get("intent") ?? "lookup");

  if (intent === "lookup") {
    return loadPrivacyOrder(orderNumber, customerPhone);
  }

  if (intent !== "anonymize") {
    return { error: "Select a valid privacy request action." };
  }

  const confirmation = String(formData.get("confirmation") ?? "").trim();

  if (confirmation !== "ANONYMIZE") {
    const lookupState = await loadPrivacyOrder(orderNumber, customerPhone);

    return {
      ...lookupState,
      error: "Type ANONYMIZE exactly before removing customer details.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("anonymize_order_customer_data", {
    lookup_order_number: orderNumber,
    lookup_customer_phone: customerPhone,
  });

  if (error) {
    if (
      error.message ===
        "Complete or cancel this order before anonymizing customer details." ||
      error.message ===
        "Order details did not match or customer data was already anonymized."
    ) {
      const lookupState = await loadPrivacyOrder(orderNumber, customerPhone);
      return { ...lookupState, error: error.message };
    }

    const referenceId = reportServerError({
      operation: "admin.privacy_request.anonymize",
      error,
    });

    return {
      error: withErrorReference(
        "Unable to anonymize the selected order.",
        referenceId,
      ),
    };
  }

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    typeof (data as { order_number?: unknown }).order_number !== "string"
  ) {
    const referenceId = reportServerError({
      operation: "admin.privacy_request.parse_anonymize",
      error: new Error("Unexpected anonymization response"),
    });

    return {
      error: withErrorReference(
        "Unable to confirm the selected order anonymization.",
        referenceId,
      ),
    };
  }

  revalidatePath(routes.adminDataRetention);
  revalidatePath(routes.adminOrders);
  revalidatePath(`${routes.adminOrders}/${orderNumber}`);

  return {
    saved: `Customer details for ${(data as { order_number: string }).order_number} were anonymized.`,
  };
}
