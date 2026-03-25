/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Proxy: o browser chama /proxy/* → backend interno
  // Assim NEXT_PUBLIC nunca precisa expor localhost:3001
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ]
  },
  images: {
    domains: ['api.dicebear.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
