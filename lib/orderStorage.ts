const LEGACY_ORDER_STORAGE_KEY = "junerose_orders";
const RECENT_ORDER_ACCESS_KEY = "junerose_recent_order_access";
const RECENT_ORDER_REFERENCES_KEY = "junerose_recent_order_references";
const ACCESS_LIFETIME_MS = 10 * 60 * 1000;
const REFERENCE_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_RECENT_ORDER_REFERENCES = 5;

type RecentOrderAccess = {
  orderNumber: string;
  phone: string;
  expiresAt: number;
};

export type RecentOrderReference = {
  orderNumber: string;
  savedAt: number;
  expiresAt: number;
};

function isRecentOrderReference(
  value: unknown,
): value is RecentOrderReference {
  if (!value || typeof value !== "object") {
    return false;
  }

  const reference = value as Partial<RecentOrderReference>;

  return (
    typeof reference.orderNumber === "string" &&
    reference.orderNumber.startsWith("JR-") &&
    reference.orderNumber.length <= 40 &&
    typeof reference.savedAt === "number" &&
    typeof reference.expiresAt === "number"
  );
}

function writeRecentOrderReferences(references: RecentOrderReference[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (references.length === 0) {
      window.localStorage.removeItem(RECENT_ORDER_REFERENCES_KEY);
      return;
    }

    window.localStorage.setItem(
      RECENT_ORDER_REFERENCES_KEY,
      JSON.stringify(references),
    );
  } catch {
    // Order lookup remains available when browser storage is unavailable.
  }
}

export function clearLegacyOrderStorage() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LEGACY_ORDER_STORAGE_KEY);
}

export function saveRecentOrderAccess(orderNumber: string, phone: string) {
  if (typeof window === "undefined") {
    return;
  }

  clearLegacyOrderStorage();
  saveRecentOrderReference(orderNumber);

  const access: RecentOrderAccess = {
    orderNumber,
    phone,
    expiresAt: Date.now() + ACCESS_LIFETIME_MS,
  };

  window.sessionStorage.setItem(
    RECENT_ORDER_ACCESS_KEY,
    JSON.stringify(access),
  );
}

export function getRecentOrderReferences(): RecentOrderReference[] {
  if (typeof window === "undefined") {
    return [];
  }

  clearLegacyOrderStorage();

  try {
    const storedValue = window.localStorage.getItem(
      RECENT_ORDER_REFERENCES_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue) as unknown;

    if (!Array.isArray(parsedValue)) {
      writeRecentOrderReferences([]);
      return [];
    }

    const seenOrderNumbers = new Set<string>();
    const references = parsedValue
      .filter(isRecentOrderReference)
      .filter((reference) => reference.expiresAt > Date.now())
      .sort((left, right) => right.savedAt - left.savedAt)
      .filter((reference) => {
        if (seenOrderNumbers.has(reference.orderNumber)) {
          return false;
        }

        seenOrderNumbers.add(reference.orderNumber);
        return true;
      })
      .slice(0, MAX_RECENT_ORDER_REFERENCES);

    writeRecentOrderReferences(references);
    return references;
  } catch {
    writeRecentOrderReferences([]);
    return [];
  }
}

export function saveRecentOrderReference(orderNumber: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedOrderNumber = orderNumber.trim().toUpperCase();

  if (
    !normalizedOrderNumber.startsWith("JR-") ||
    normalizedOrderNumber.length > 40
  ) {
    return;
  }

  const savedAt = Date.now();
  const references = getRecentOrderReferences().filter(
    (reference) => reference.orderNumber !== normalizedOrderNumber,
  );

  writeRecentOrderReferences(
    [
      {
        orderNumber: normalizedOrderNumber,
        savedAt,
        expiresAt: savedAt + REFERENCE_LIFETIME_MS,
      },
      ...references,
    ].slice(0, MAX_RECENT_ORDER_REFERENCES),
  );
}

export function removeRecentOrderReference(orderNumber: string) {
  writeRecentOrderReferences(
    getRecentOrderReferences().filter(
      (reference) => reference.orderNumber !== orderNumber,
    ),
  );
}

export function clearRecentOrderReferences() {
  writeRecentOrderReferences([]);
}

export function consumeRecentOrderPhone(orderNumber: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  clearLegacyOrderStorage();

  const storedAccess = window.sessionStorage.getItem(RECENT_ORDER_ACCESS_KEY);
  window.sessionStorage.removeItem(RECENT_ORDER_ACCESS_KEY);

  if (!storedAccess) {
    return null;
  }

  try {
    const access = JSON.parse(storedAccess) as Partial<RecentOrderAccess>;

    if (
      access.orderNumber !== orderNumber ||
      typeof access.phone !== "string" ||
      !access.phone ||
      typeof access.expiresAt !== "number" ||
      access.expiresAt < Date.now()
    ) {
      return null;
    }

    return access.phone;
  } catch {
    return null;
  }
}
