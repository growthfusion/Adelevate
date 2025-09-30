import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
    },
    server: {
        port: 5176,
        proxy: {
            "/api": {
                target: "http://localhost:3002",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
