import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        name: "Mikoto (MOOCs #)",
        description: "INIAD MOOCs の利便性を向上させるユーザースクリプト",
        author: "Mikoto Team",
        icon: "https://moocs.iniad.org/favicon.ico",
        namespace: "org.iniad.moocs.mikoto-sharp",
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
      "@mikoto-moocs-sharp/shared/styles": path.resolve(__dirname, "../shared/src/styles"),
      "@mikoto-moocs-sharp/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
