import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  server: {
    port: 5176,
    proxy: {
      // Existing proxy for your local backend
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false
      },
      // New proxy for campaigns API
      "/campaigns-api": {
        target: "http://5.78.123.130:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/campaigns-api/, "/v1")
      },
      // Proxy for reports API
      "/reports-api": {
        target: "http://65.109.65.93:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/reports-api/, "/v1/reports")
      }
    }
  }
});
