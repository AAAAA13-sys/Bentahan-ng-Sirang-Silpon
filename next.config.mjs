const config = {
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  poweredByHeader: false,
  async rewrites() {
    if (process.env.USE_EXPRESS_BACKEND === 'true' || process.env.BACKEND_URL) {
      const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
};
export default config;
