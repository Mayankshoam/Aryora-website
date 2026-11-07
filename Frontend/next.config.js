/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/ring-builder",
        destination: "/customize",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
