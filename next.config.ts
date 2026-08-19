import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.tutorlog.id" }],
        destination: "https://tutorlog.id/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
