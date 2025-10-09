import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    permissions: ["storage"],
    content_scripts: [
      {
        matches: ["https://moocs.iniad.org/*"],
        js: ["mikoto-userscript.js"],
      },
    ],
  },
});
