import "./src/env.mjs";
import nextPwa from "next-pwa";

const withPWA = nextPwa({
  dest: "public",
});
 
/** @type {import("next").NextConfig} */
const config = {
  /** ... */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
        {
            protocol: 'https',
            hostname: "s4.anilist.co",

        },
        {
            protocol: 'https',
            hostname: "artworks.thetvdb.com",

        }
    ],
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
};
 
export default process.env.NODE_ENV === "development" ? config : withPWA(config);