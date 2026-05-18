import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "wxt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Mikoto (MOOCs#)",
    permissions: ["storage", "notifications", "alarms"],
  },
  vite: () => ({
    resolve: {
      alias: {
        "@mikoto-moocs-sharp/shared/styles": path.resolve(
          __dirname,
          "../shared/src/styles",
        ),
      },
    },
  }),
});
