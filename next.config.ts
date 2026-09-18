import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output only for Docker builds (the Dockerfile sets
  // NEXT_OUTPUT=standalone). Kept off by default so that `next start`
  // keeps working on plain Node buildpacks (Render, Koyeb, a VPS...).
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  // pg is a Node-only package: keep it out of the bundler.
  serverExternalPackages: ["pg"],
  // Allow accessing the dev server via the LAN IP (e.g. http://172.25.64.1:3000)
  // so the client-side JS isn't blocked by the cross-origin dev protection.
  allowedDevOrigins: ["172.25.64.1", "172.25.64.1:3000", "localhost:3000"],
};

export default nextConfig;
