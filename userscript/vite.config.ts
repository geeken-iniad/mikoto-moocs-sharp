import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "../public",
  },
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        icon: "https://vitejs.dev/logo.svg",
        namespace: "npm/vite-plugin-monkey",
        match: ["https://moocs.iniad.org/*"],
      },
      build: {
        fileName: "mikoto-userscript.js",
      },
    }),
  ],
});