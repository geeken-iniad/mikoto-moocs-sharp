import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.{test,spec}.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.output/**",
      "**/.wxt/**",
    ],
    passWithNoTests: true,
    watch: false,
  },
});
