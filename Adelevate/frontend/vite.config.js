import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") }
  },
  server: {
    proxy: {
      // Proxy the API request in development to avoid CORS issues
      "/reports-api": {
        target: "http://65.109.65.93:8080",  // Use the actual backend server URL
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/reports-api/, "/v1/reports")  // Ensure the path gets mapped correctly
      }
    }
  }
});
