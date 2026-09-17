import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // better-sqlite3 is a native addon: keep it out of the bundler.
  serverExternalPackages: ["better-sqlite3"],
  // Allow accessing the dev server via the LAN IP (e.g. http://172.25.64.1:3000)
  // so the client-side JS isn't blocked by the cross-origin dev protection.
  allowedDevOrigins: ["172.25.64.1", "172.25.64.1:3000", "localhost:3000"],
};

export default nextConfig;
