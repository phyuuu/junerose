import "server-only";

import { randomUUID } from "node:crypto";

type SafeErrorContext = {
  operation: string;
  error: unknown;
  productId?: number;
  variantId?: number;
  noteId?: number;
  imageId?: number;
  sizeId?: number;
  colorId?: number;
};

function getErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code.slice(0, 50) : undefined;
}

function getErrorStatus(error: unknown) {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function reportServerError({
  operation,
  error,
  productId,
  variantId,
  noteId,
  imageId,
  sizeId,
  colorId,
}: SafeErrorContext) {
  const referenceId = randomUUID();

  console.error(
    JSON.stringify({
      level: "error",
      application: "junerose",
      referenceId,
      operation,
      errorType: error instanceof Error ? error.name : typeof error,
      errorCode: getErrorCode(error),
      errorStatus: getErrorStatus(error),
      productId,
      variantId,
      noteId,
      imageId,
      sizeId,
      colorId,
      occurredAt: new Date().toISOString(),
    }),
  );

  return referenceId;
}

export function withErrorReference(message: string, referenceId: string) {
  return `${message} Reference: ${referenceId}.`;
}

export function throwReportedServerError(
  context: SafeErrorContext & { message: string },
): never {
  const referenceId = reportServerError(context);
  throw new Error(withErrorReference(context.message, referenceId));
}
