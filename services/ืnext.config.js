/** @type {import('next').NextConfig} */
const nextConfig = {
  // Point to src directory where app folder is located
  distDir: ".next",
  typescript: {
    ignoreBuildErrors: false,
  },
};
module.exports = nextConfig;
