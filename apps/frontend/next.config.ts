import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal configuration to avoid chunk loading issues
  poweredByHeader: false,
  
  // Disable experimental features that might cause chunk errors
  experimental: {},
  
  // Ensure proper webpack configuration
  webpack: (config) => {
    // Prevent chunk loading issues
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
};

export default nextConfig;
