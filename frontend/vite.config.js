import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// vite proxies /api to flask so the browser sees a single origin in dev,
// which keeps the session cookie behavior simple.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: false,
      },
    },
  },
});
