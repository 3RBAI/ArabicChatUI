import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React and React DOM into separate chunk
          'react-vendor': ['react', 'react-dom'],
          // Split Radix UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-scroll-area'
          ],
          // Split markdown rendering
          'markdown': ['react-markdown', 'react-syntax-highlighter'],
          // Split query client
          'query': ['@tanstack/react-query'],
          // Split icons
          'icons': ['lucide-react', 'react-icons']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

