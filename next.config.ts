import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    mdxRs: true
  },
  allowedDevOrigins: ["127.0.0.1"]
};

export default withMDX(nextConfig);
