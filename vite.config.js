import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "resources/js/MsiaMap.js"),
      name: "MsiaMap",
      fileName: () => "MsiaMap.js",
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        assetFileNames: "css/[name][extname]",
      },
    },
    outDir: "dist",
  },
});
