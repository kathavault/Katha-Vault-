
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ** Configure static export for GitHub Pages **
  output: 'export',
  // Optional: Add trailing slashes for compatibility with some static hosts
  // trailingSlash: true,
  // Optional: Configure basePath if deploying to a subdirectory like username.github.io/repo-name
  // basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : '',
  // Optional: Configure assetPrefix if using a CDN
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.example.com' : '',

  images: {
    // Use unoptimized images for static export or configure a custom loader
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
