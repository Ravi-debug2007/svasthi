import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Minimal Vitest setup (F11 start) — harness only, no feature logic yet.
 * Future tickets add unit tests under tests/unit/ and e2e under tests/e2e/.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
