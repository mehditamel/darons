import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary"],
      // Couverture mesurée sur la logique métier critique (calculs fiscaux/CAF,
      // validation Zod, utilitaires) — pas sur les composants/pages UI, testés
      // en E2E. Seuils calibrés sous la couverture actuelle pour prévenir les
      // régressions sans bloquer artificiellement.
      include: [
        "src/lib/simulators/**",
        "src/lib/validators/**",
        "src/lib/utils.ts",
        "src/lib/errors.ts",
      ],
      thresholds: {
        lines: 72,
        functions: 60,
        branches: 68,
        statements: 72,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
