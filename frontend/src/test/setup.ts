import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { vi, beforeEach, afterEach } from "vitest";

// Ensure frontend unit tests remain hermetic and isolated from ambient dev servers on localhost:8000
beforeEach(() => {
  if (!vi.isMockFunction(globalThis.fetch)) {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.reject(new TypeError("fetch failed"))
    );
  }
});
