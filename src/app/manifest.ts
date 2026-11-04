import type { MetadataRoute } from "next";

/** Makes "Add to Home Screen" install Dearly with its own icon and app-like window. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dearly",
    short_name: "Dearly",
    description: "Write handwritten-style letters and send them in envelopes that open with a tap.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ECEBE7",
    theme_color: "#ECEBE7",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Artwork sits inside the central safe zone, so it is also safe to mask.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
