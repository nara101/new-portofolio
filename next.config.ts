import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // An unrelated package-lock.json in the user's home directory otherwise wins
  // root inference and drags the whole home tree into the build graph.
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // The legacy/ folder holds the pre-redesign static site. It is kept for
  // reference only and must never be compiled.
  outputFileTracingExcludes: {
    "*": ["./legacy/**"],
  },
};

export default nextConfig;
