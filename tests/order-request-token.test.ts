import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { installBrowserStorage } from "@/tests/browser-storage";
import {
  clearOrderRequestToken,
  getOrCreateOrderRequestToken,
} from "@/lib/orderRequestToken";

const firstToken = "018f1f89-4eb7-7f35-8ac1-4a689d73303c";
const secondToken = "018f1f89-4eb7-7f35-8ac1-4a689d73303d";

describe("order request token", () => {
  beforeEach(() => {
    installBrowserStorage();
    clearOrderRequestToken();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reuses one token for retries of the same cart", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => firstToken),
    });

    const items = [{ variantId: 12, quantity: 2 }];

    expect(getOrCreateOrderRequestToken(items)).toBe(firstToken);
    expect(getOrCreateOrderRequestToken(items)).toBe(firstToken);
    expect(crypto.randomUUID).toHaveBeenCalledTimes(1);
  });

  it("creates a new token when the cart changes", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce(firstToken)
        .mockReturnValueOnce(secondToken),
    });

    expect(
      getOrCreateOrderRequestToken([{ variantId: 12, quantity: 1 }]),
    ).toBe(firstToken);
    expect(
      getOrCreateOrderRequestToken([{ variantId: 12, quantity: 2 }]),
    ).toBe(secondToken);
  });

  it("creates a new token after the previous order succeeds", () => {
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce(firstToken)
        .mockReturnValueOnce(secondToken),
    });

    const items = [{ variantId: 12, quantity: 1 }];

    expect(getOrCreateOrderRequestToken(items)).toBe(firstToken);
    clearOrderRequestToken();
    expect(getOrCreateOrderRequestToken(items)).toBe(secondToken);
  });

  it("stores no customer contact information", () => {
    const { sessionStorage } = installBrowserStorage();
    vi.stubGlobal("crypto", {
      randomUUID: vi.fn(() => firstToken),
    });

    getOrCreateOrderRequestToken([{ variantId: 12, quantity: 1 }]);

    const storedValue = sessionStorage.getItem(
      "junerose_order_request_token",
    );

    expect(storedValue).toContain(firstToken);
    expect(storedValue).toContain("12");
    expect(storedValue).not.toContain("phone");
    expect(storedValue).not.toContain("address");
  });
});
