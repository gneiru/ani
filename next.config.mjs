import { hostname } from "os";
import "./src/env.mjs";
 
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
 
export default config;