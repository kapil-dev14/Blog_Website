/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }, // allow cover images from any https source
    ],
  },
};

module.exports = nextConfig;
