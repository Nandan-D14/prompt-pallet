import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js specific modules on the client to prevent errors
      config.resolve.fallback = {
        fs: false,
        child_process: false,
        net: false,
        tls: false,
        dns: false,
        http: false,
        https: false,
        url: false,
        util: false,
        assert: false,
        stream: false,
        os: false,
        zlib: false,
        path: false,
        crypto: require.resolve('crypto-browserify'),
        buffer: require.resolve('buffer/'),
      };
      
      // Use null-loader for all Node.js modules that cause issues
      config.module.rules.push({
        test: /\.node$/,
        use: 'null-loader'
      });
      
      // Explicitly handle problematic Node.js modules with a more general approach
      config.module.rules.push({
        test: /node_modules[\\/](?:google-auth-library|http-proxy-agent|https-proxy-agent|teeny-request|agent-base|gcp-metadata)/,
        use: 'null-loader'
      });
    }
    return config;
  },
};

export default nextConfig;
