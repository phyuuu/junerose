import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRecentOrderReferences,
  clearLegacyOrderStorage,
  consumeRecentOrderPhone,
  getRecentOrderReferences,
  removeRecentOrderReference,
  saveRecentOrderAccess,
  saveRecentOrderReference,
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

  it("stores short-lived access and a contact-free order reference", () => {
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
    expect(
      JSON.parse(
        localStorage.getItem("junerose_recent_order_references") ?? "[]",
      ),
    ).toEqual([
      {
        orderNumber: "JR-TEST-1",
        savedAt: 1_000_000,
        expiresAt: 2_593_000_000,
      },
    ]);
    expect(
      localStorage.getItem("junerose_recent_order_references"),
    ).not.toContain("0912345678");

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

  it("keeps the five newest unique order references", () => {
    for (let index = 1; index <= 6; index += 1) {
      vi.mocked(Date.now).mockReturnValue(1_000_000 + index);
      saveRecentOrderReference(`JR-TEST-${index}`);
    }

    saveRecentOrderReference("JR-TEST-4");

    expect(
      getRecentOrderReferences().map((reference) => reference.orderNumber),
    ).toEqual([
      "JR-TEST-4",
      "JR-TEST-6",
      "JR-TEST-5",
      "JR-TEST-3",
      "JR-TEST-2",
    ]);
  });

  it("removes expired, selected, or all recent references", () => {
    saveRecentOrderReference("JR-TEST-1");
    vi.mocked(Date.now).mockReturnValue(1_000_001);
    saveRecentOrderReference("JR-TEST-2");

    removeRecentOrderReference("JR-TEST-1");
    expect(getRecentOrderReferences()).toHaveLength(1);

    clearRecentOrderReferences();
    expect(getRecentOrderReferences()).toEqual([]);

    saveRecentOrderReference("JR-TEST-3");
    vi.mocked(Date.now).mockReturnValue(2_593_000_001);
    expect(getRecentOrderReferences()).toEqual([]);
  });
});
