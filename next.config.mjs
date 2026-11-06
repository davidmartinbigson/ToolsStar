/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // Static-friendly: every page is SSG by default in the App Router,
  // which is what makes Tools Stars fast and easy for Google to index.
  // Canonical host: www 301-redirects to the apex domain so SEO signals,
  // favicons and crawls consolidate on a single origin (Google indexed both).
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.toolsstars.com" }],
        destination: "https://toolsstars.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
