/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "salamrubyStorage",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "@aws-sdk/client-s3",
        "@aws-sdk/s3-presigned-post",
        "@aws-sdk/s3-request-presigner",
        "@salamruby/logger",
      ],
    },
  },
  test: {
    environment: "node",
    globals: true,
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["src/types/**"],
      include: ["src/**/*.ts"],
    },
  },
});
