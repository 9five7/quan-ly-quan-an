import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['ik.imagekit.io','localhost','via.placeholder.com'], // Thêm domain của ImageKit
  },

};

export default nextConfig;
