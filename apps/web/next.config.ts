import type { NextConfig } from 'next';
import path from 'node:path';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
