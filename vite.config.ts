import { defineConfig } from "vite";

// Relative base so the same dist/ works at a domain root, at /buttonco/ on
// GitHub Pages, or from the filesystem. Override with VITE_BASE if needed.
export default defineConfig({
  base: process.env.VITE_BASE ?? "./",
  build: {
    target: "es2022",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
