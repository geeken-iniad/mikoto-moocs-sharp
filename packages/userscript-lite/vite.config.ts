import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
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
        name: "Mikoto (MOOCs#) Lite",
        description: "MOOCsをより便利に (基本機能版)",
        author: "INIAD MDX",
        icon: "https://moocs.iniad.org/favicon.ico",
        namespace: "https://github.com/iniad-mdx",
        match: ["https://moocs.iniad.org/*"],
        "run-at": "document-idle",
        grant: [
          "GM_getValue",
          "GM_setValue",
          "GM_deleteValue",
          "GM_addValueChangeListener",
          "GM_removeValueChangeListener",
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
      "@mikoto-moocs-sharp/shared": path.resolve(
        __dirname,
        "../shared/src/index.ts",
      ),
      "@mikoto-moocs-sharp/userscript-base/main": path.resolve(
        __dirname,
        "../userscript-base/src/main.tsx",
      ),
      "@mikoto-moocs-sharp/userscript-base/mainLite": path.resolve(
        __dirname,
        "../userscript-base/src/mainLite.tsx",
      ),
      "@mikoto-moocs-sharp/userscript-base": path.resolve(
        __dirname,
        "../userscript-base/src/index.ts",
      ),
    },
  },
});
