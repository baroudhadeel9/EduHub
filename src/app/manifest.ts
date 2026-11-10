import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EduHub Gaza | حاضنة إديو هب غزة",
    short_name: "EduHub",
    description: "حاضنة ومساحة عمل ومذاكرة جامعية مجهزة بالطاقة الشمسية والإنترنت فائق السرعة في غزة",
    start_url: "/",
    display: "standalone",
    background_color: "#0c2340",
    theme_color: "#0c2340",
    orientation: "portrait",
    dir: "rtl",
    lang: "ar",
    categories: ["education", "productivity", "business"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}

