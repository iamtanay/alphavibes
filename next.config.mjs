/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow image domains for persona photos
  images: {
    domains: ["localhost"],
  },
  // Suppress hydration warnings in dev for theme
  reactStrictMode: true,
};

export default nextConfig;
