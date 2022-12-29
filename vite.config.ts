import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import {visualizer} from "rollup-plugin-visualizer";
export default defineConfig({
  plugins: [
    visualizer({
      gzipSize: true,
      template: 'treemap',
      filename: 'stats/rollup-stats.html',
    }),
    react({
      // jsxImportSource: '@welldone-software/why-did-you-render'
    }),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: ["es2021", "chrome100", "safari13"],
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
});
