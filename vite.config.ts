// @lovable.dev/vite-tanstack-config already includes TanStack, Tailwind, Nitro (default: cloudflare).
// Here we override Nitro to target Vercel for deployment on vercel.com.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
