import type { NextConfig } from 'next';
import path from 'node:path';
<<<<<<< HEAD
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
=======

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
>>>>>>> origin/backend-merge
};
export default nextConfig;

