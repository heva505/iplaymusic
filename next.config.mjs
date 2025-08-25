/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Spotify images via next/image
  images: {
    domains: ["i.scdn.co"], // Just the hostname, no protocol
  },

  // SASS preprocessing defaults
  sassOptions: {
    additionalData: `$var: red;`,
  },
};

export default nextConfig;
