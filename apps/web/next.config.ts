import type { NextConfig } from 'next';
import path from 'node:path';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
