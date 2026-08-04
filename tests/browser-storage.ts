import { vi } from "vitest";

export class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }
}

export function installBrowserStorage() {
  const localStorage = new MemoryStorage();
  const sessionStorage = new MemoryStorage();
  const dispatchEvent = vi.fn();

  vi.stubGlobal("window", {
    localStorage,
    sessionStorage,
    dispatchEvent,
  });
  vi.stubGlobal(
    "Event",
    class TestEvent {
      constructor(public readonly type: string) {}
    },
  );

  return {
    localStorage,
    sessionStorage,
    dispatchEvent,
  };
}
