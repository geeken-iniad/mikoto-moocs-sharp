import { defineConfig } from "wxt";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
  },
  vite: () => ({
    resolve: {
      alias: {
        "@mikoto-moocs-sharp/shared/styles": path.resolve(__dirname, "../shared/src/styles"),
        "@mikoto-moocs-sharp/shared": path.resolve(__dirname, "../shared/src/index.ts"),
      },
    },
  }),
});
