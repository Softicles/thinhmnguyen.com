import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                // Split large, rarely-changing vendor libs into their own chunks
                // so browsers can cache them across app deploys (and download them
                // in parallel). three.js is by far the biggest and almost never
                // changes, so isolating it is the main win.
                manualChunks(id) {
                    if (!id.includes("node_modules")) return;
                    if (/node_modules\/(three|@react-three)\//.test(id)) return "three-vendor";
                    if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return "react-vendor";
                    if (/node_modules\/framer-motion\//.test(id)) return "framer-vendor";
                },
            },
        },
    },
});
