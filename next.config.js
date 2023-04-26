const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      { hostname: "files.stripe.com" },
      { hostname: "framerusercontent.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    swcPlugins: [
      [
        "next-superjson-plugin",
        {
          excluded: [],
        },
      ],
    ],
  },
};

module.exports = withContentlayer(nextConfig);
