import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import webSpatial from "@webspatial/vite-plugin";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    webSpatial(),
    createHtmlPlugin({
      inject: {
        data: {
          XR_ENV: process.env.VITE_XR_ENV,
        },
      },
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  define: {
    // Inject XR_ENV into runtime code
    __XR_ENV__: JSON.stringify(process.env.VITE_XR_ENV || ""),
  },
});
