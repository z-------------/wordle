import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude,
      "dist*/",
    ],
    coverage: {
      exclude: [
        ...(configDefaults.coverage.exclude ?? []),
        "dist*/",
      ],
    },
  },
});
