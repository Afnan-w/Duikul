import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      reporter: ["text", "html"],
      include: ["src/lib/ingest/**/*.ts"],
      exclude: ["src/lib/ingest/**/*.test.ts", "src/lib/ingest/__tests__/**"],
    },
  },
});
