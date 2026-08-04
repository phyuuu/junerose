const LEGACY_ORDER_STORAGE_KEY = "junerose_orders";
const RECENT_ORDER_ACCESS_KEY = "junerose_recent_order_access";
const ACCESS_LIFETIME_MS = 10 * 60 * 1000;

type RecentOrderAccess = {
  orderNumber: string;
  phone: string;
  expiresAt: number;
};

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
