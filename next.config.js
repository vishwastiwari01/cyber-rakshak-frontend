/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // NEXT_PUBLIC_API is set in Vercel dashboard → Environment Variables
  // It gets inlined at build time automatically by Next.js
}

module.exports = nextConfig
