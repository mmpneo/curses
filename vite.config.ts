import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    // visualizer({
    //   gzipSize: true,
    //   template: 'treemap',
    //   filename: 'stats/rollup-stats.html',
    // }),
    react({
      // jsxImportSource: '@welldone-software/why-did-you-render'
    }),
    VitePWA({
      workbox: {
        skipWaiting: true
      },
      injectRegister: null,
      // devOptions: {
      //   enabled: true
      // },
    }),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_", "CURSES_"],
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
  },
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome100", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
