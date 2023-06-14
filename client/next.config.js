const { createProxyMiddleware } = require("http-proxy-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
};

// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: "/api/:path*", // Match any request starting with '/api/'
//         destination: "http://localhost:8000/:path*", // Proxy the request to your Django backend server
//       },
//     ];
//   },
// };

module.exports = nextConfig;
