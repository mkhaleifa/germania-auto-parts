import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Germania Auto Parts",
    short_name: "Germania Auto Parts",
    description: "Premium German auto parts shipped worldwide.",
    start_url: "/",
    display: "standalone",
    theme_color: "#DC2626",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icons/icons8-germany-58.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icons8-germany-58.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}