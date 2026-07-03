import { resolve } from 'node:path';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],

  build: {
    outDir: resolve(import.meta.dirname, "dist"),
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      name: "UnoApi",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: []
    },
    minify: 'terser'

  }

});
