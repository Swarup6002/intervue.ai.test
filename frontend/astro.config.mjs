// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import monitoring from "./src/lib/shims/monitoring-astro.js";
import react from "@astrojs/react";
import sourceAttrsPlugin from "./src/lib/shims/source-attrs-plugin.js";
import dynamicDataPlugin from "./src/lib/shims/dynamic-data-plugin.js";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";

const isBuild = process.env.NODE_ENV == "production";

// https://astro.build/config
export default defineConfig({
  output: "static",
  integrations: [
    tailwind(),
    isBuild ? monitoring() : undefined,
    react({ babel: { plugins: [sourceAttrsPlugin, dynamicDataPlugin] } }),
  ],
  vite: {
    plugins: [
      customErrorOverlayPlugin(),
    ],
  },
  adapter: vercel(),
  devToolbar: {
    enabled: false,
  },
  image: {
    domains: ["cdn.example.com"],
  },
  server: {
    allowedHosts: true,
    host: true,
  },
});
