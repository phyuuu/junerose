const ORDER_REQUEST_TOKEN_KEY = "junerose_order_request_token";
const TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type OrderTokenItem = {
  variantId: number;
  quantity: number;
};

type StoredOrderRequestToken = {
  token: string;
  cartKey: string;
  expiresAt: number;
};

let fallbackToken: StoredOrderRequestToken | null = null;

function createCartKey(items: OrderTokenItem[]) {
  const quantitiesByVariant = new Map<number, number>();

  for (const item of items) {
    quantitiesByVariant.set(
      item.variantId,
      (quantitiesByVariant.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  return JSON.stringify(
    [...quantitiesByVariant.entries()].sort(
      ([leftVariantId], [rightVariantId]) =>
        leftVariantId - rightVariantId,
    ),
  );
}

function readStoredToken(): StoredOrderRequestToken | null {
  if (typeof window === "undefined") {
    return fallbackToken;
  }

  try {
    const storedValue = window.sessionStorage.getItem(ORDER_REQUEST_TOKEN_KEY);

    if (!storedValue) {
      return fallbackToken;
    }

    const storedToken = JSON.parse(
      storedValue,
    ) as Partial<StoredOrderRequestToken>;

    if (
      typeof storedToken.token !== "string" ||
      !UUID_PATTERN.test(storedToken.token) ||
      typeof storedToken.cartKey !== "string" ||
      typeof storedToken.expiresAt !== "number"
    ) {
      return null;
    }

    return storedToken as StoredOrderRequestToken;
  } catch {
    return fallbackToken;
  }
}

function saveToken(token: StoredOrderRequestToken) {
  fallbackToken = token;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      ORDER_REQUEST_TOKEN_KEY,
      JSON.stringify(token),
    );
  } catch {
    // The in-memory fallback still protects repeated submissions in this tab.
  }
}

export function getOrCreateOrderRequestToken(items: OrderTokenItem[]) {
  const cartKey = createCartKey(items);
  const storedToken = readStoredToken();

  if (
    storedToken &&
    storedToken.cartKey === cartKey &&
    storedToken.expiresAt > Date.now()
  ) {
    return storedToken.token;
  }

  const token = globalThis.crypto.randomUUID();

  saveToken({
    token,
    cartKey,
    expiresAt: Date.now() + TOKEN_LIFETIME_MS,
  });

  return token;
}

export function clearOrderRequestToken() {
  fallbackToken = null;

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.removeItem(ORDER_REQUEST_TOKEN_KEY);
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}
