import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/customize/maison-loafer", destination: "/customize/ivory-gold-bit-mule", permanent: true },
      { source: "/customize/atelier-mule", destination: "/collection/shoes/noir-minimal-mule", permanent: true },
      { source: "/customize/velour-slide", destination: "/collection/shoes/camel-suede-mule", permanent: true },
      { source: "/customize/noir-minimal-mule", destination: "/collection/shoes/noir-minimal-mule", permanent: true },
      { source: "/customize/camel-suede-mule", destination: "/collection/shoes/camel-suede-mule", permanent: true },
      { source: "/customize/espresso-horsebit-mule", destination: "/collection/shoes/espresso-horsebit-mule", permanent: true },
      { source: "/collection/shoes/maison-loafer", destination: "/collection/shoes/ivory-gold-bit-mule", permanent: true },
      { source: "/collection/shoes/atelier-mule", destination: "/collection/shoes/noir-minimal-mule", permanent: true },
      { source: "/collection/shoes/velour-slide", destination: "/collection/shoes/camel-suede-mule", permanent: true },
    ];
  },
};

export default nextConfig;
