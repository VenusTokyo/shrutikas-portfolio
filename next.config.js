/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Drive's image host. Declaring it lets next/image proxy these rather than
    // the browser fetching them straight from Google — which is the whole reason
    // a live gallery is affordable: the originals in the folder are 2-6MB phone
    // photos, and this way each one is resized and re-encoded once, cached, and
    // served at the size actually asked for.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/d/**',
      },
    ],
  },
};

module.exports = nextConfig;
