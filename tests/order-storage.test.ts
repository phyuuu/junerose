import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLegacyOrderStorage,
  consumeRecentOrderPhone,
  saveRecentOrderAccess,
} from "@/lib/orderStorage";
import { installBrowserStorage, type MemoryStorage } from "./browser-storage";

describe("recent order access storage", () => {
  let localStorage: MemoryStorage;
  let sessionStorage: MemoryStorage;

  beforeEach(() => {
    ({ localStorage, sessionStorage } = installBrowserStorage());
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("deletes legacy full-order browser records", () => {
    localStorage.setItem(
      "junerose_orders",
      JSON.stringify([{ customer: { phone: "0912345678" } }]),
    );

    clearLegacyOrderStorage();

    expect(localStorage.getItem("junerose_orders")).toBeNull();
  });

  it("stores only short-lived lookup data and consumes it once", () => {
    localStorage.setItem("junerose_orders", "private legacy data");

    saveRecentOrderAccess("JR-TEST-1", "0912345678");

    const storedValue = sessionStorage.getItem(
      "junerose_recent_order_access",
    );
    expect(storedValue).not.toBeNull();
    expect(JSON.parse(storedValue ?? "{}")).toEqual({
      orderNumber: "JR-TEST-1",
      phone: "0912345678",
      expiresAt: 1_600_000,
    });
    expect(localStorage.getItem("junerose_orders")).toBeNull();

    expect(consumeRecentOrderPhone("JR-TEST-1")).toBe("0912345678");
    expect(consumeRecentOrderPhone("JR-TEST-1")).toBeNull();
  });

  it("rejects expired or mismatched access", () => {
    saveRecentOrderAccess("JR-TEST-1", "0912345678");

    expect(consumeRecentOrderPhone("JR-OTHER")).toBeNull();

    saveRecentOrderAccess("JR-TEST-1", "0912345678");
    vi.mocked(Date.now).mockReturnValue(1_600_001);

    expect(consumeRecentOrderPhone("JR-TEST-1")).toBeNull();
  });
});
