import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        name: "Mikoto (MOOCs#) Pro",
        description: "MOOCsをより便利に (全機能版)",
        author: "INIAD MDX",
        icon: "https://moocs.iniad.org/favicon.ico",
        namespace: "https://github.com/geeken-iniad",
        match: ["https://moocs.iniad.org/*"],
        "run-at": "document-idle",
        grant: [
          "GM_getValue",
          "GM_setValue",
          "GM_deleteValue",
          "GM_addValueChangeListener",
          "GM_removeValueChangeListener",
          "GM_registerMenuCommand",
          "GM_notification",
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      $: "vite-plugin-monkey/dist/client",
      "@mikoto-moocs-sharp/shared/styles": path.resolve(
        __dirname,
        "../shared/src/styles",
      ),
      "@mikoto-moocs-sharp/shared": path.resolve(__dirname, "../shared/src"),
      "@mikoto-moocs-sharp/userscript-runtime/main": path.resolve(
        __dirname,
        "../userscript-runtime/src/main.tsx",
      ),
      "@mikoto-moocs-sharp/userscript-runtime": path.resolve(
        __dirname,
        "../userscript-runtime/src",
      ),
    },
  },
});
