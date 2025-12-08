import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname), // garante que o Vite sirva o index.html corretamente
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"), // saída do build
    emptyOutDir: true,
  },
});
