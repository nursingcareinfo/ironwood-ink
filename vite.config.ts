import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        atlas: resolve(__dirname, "atlas.html"),
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
