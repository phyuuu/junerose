export type AdminPrivacyOrderVerification = {
  orderNumber: string;
  customerPhone: string;
};

type AdminPrivacyOrderVerificationResult =
  | { data: AdminPrivacyOrderVerification; error?: never }
  | { data?: never; error: string };

export function validateAdminPrivacyOrderVerification(
  orderNumberValue: FormDataEntryValue | null,
  customerPhoneValue: FormDataEntryValue | null,
): AdminPrivacyOrderVerificationResult {
  const orderNumber = String(orderNumberValue ?? "").trim();
  const customerPhone = String(customerPhoneValue ?? "").trim();
  const normalizedPhone = customerPhone.replace(/[^0-9]/g, "");

  if (!orderNumber || orderNumber.length > 40) {
    return { error: "Enter a valid order number." };
  }

  if (
    !customerPhone ||
    customerPhone.length > 30 ||
    normalizedPhone.length < 7 ||
    normalizedPhone.length > 15
  ) {
    return { error: "Enter the phone number used for this order." };
  }

  return {
    data: {
      orderNumber,
      customerPhone,
    },
  };
}
