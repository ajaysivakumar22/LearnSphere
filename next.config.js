/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    domains: ['localhost', 'supabase.co'],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/sign-up',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig
