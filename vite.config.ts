import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base relativo para funcionar em GitHub Pages (subpasta) no futuro.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
