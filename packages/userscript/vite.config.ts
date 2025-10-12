import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        name: 'Mikoto (MOOCs #)',
        namespace: 'https://github.com/iniad-mdx/mikoto-moocs-sharp',
        version: '0.1.0',
        description: 'MOOCsをより便利に',
        author: 'INIAD MDX',
        match: [
          'https://moocs.iniad.org/*',
        ],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=iniad.org',
        grant: ['GM_setValue', 'GM_getValue'],
      },
    }),
  ],
});
