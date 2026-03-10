/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "ufs.uploadthing.com" },
      { protocol: "https", hostname: "uploadthing.com" },
    ],
  },
};

export default nextConfig;
