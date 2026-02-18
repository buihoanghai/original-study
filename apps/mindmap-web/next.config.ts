import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mindmap/domain', '@mindmap/editor', '@mindmap/flashcard', '@mindmap/sync'],
};

export default nextConfig;
