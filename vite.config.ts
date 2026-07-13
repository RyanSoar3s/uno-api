import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    tsconfigPaths: true

  },
  plugins: [
    {
      name: 'copy-graphql',
      writeBundle() {
        const outDir = resolve(import.meta.dirname, 'dist');
        const src = resolve(import.meta.dirname, 'src/schema/typesDef.graphql');
        const dest = resolve(outDir, 'typesDef.graphql');

        mkdirSync(outDir, { recursive: true });
        copyFileSync(src, dest);

      }

    }

  ],
  build: {
    ssr: true,
    outDir: resolve(import.meta.dirname, "dist"),
    lib: {
      entry: resolve(import.meta.dirname, "src/server.ts"),
      name: "UnoApi",
      formats: ["es"],
      fileName: "index"
    },
    rollupOptions: {
      external: [
        /node_modules/
      ]

    },
    minify: "terser"

  }

});
