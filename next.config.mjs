/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — a parent lockfile exists above this project.
  outputFileTracingRoot: import.meta.dirname,
  // Hide the dev tools indicator badge (the floating circle in dev).
  devIndicators: false,
};

export default nextConfig;
