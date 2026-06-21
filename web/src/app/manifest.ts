import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ethiopian Business Hub UK",
    short_name: "EBH",
    description:
      "Discover, support and grow Ethiopian businesses, events and services across the UK.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f3d28",
    theme_color: "#15613e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
