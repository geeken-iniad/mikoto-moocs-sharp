import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "wxt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Mikoto (MOOCs#)",
    permissions: ["storage"],
  },
  vite: () => ({
    resolve: {
      alias: {
        "@mikoto-moocs-sharp/shared/styles": path.resolve(
          __dirname,
          "../shared/src/styles",
        ),
        "@mikoto-moocs-sharp/shared": path.resolve(
          __dirname,
          "../shared/src",
        ),
      },
    },
  }),
});
