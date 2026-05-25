import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/queue-management/" : "/",
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
}));
