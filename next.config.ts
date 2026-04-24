import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    "6000-firebase-studio-1760562415474.cluster-udxxdyopu5c7cwhhtg6mmadhvs.cloudworkstations.dev",
    "ais-dev-wxib32xiqcmvrf3jicdbnu-355692640667.us-east1.run.app"
  ],
};

export default nextConfig;
