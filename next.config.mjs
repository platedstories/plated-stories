/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first (roughly 20-30% smaller than WebP for photos), WebP for
    // browsers without AVIF support.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/**`,
      },
    ],
  },
};

export default nextConfig;
