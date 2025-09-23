import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  test: {
    environment: "jsdom",
    globals: true,
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage"
    }
  }
});
