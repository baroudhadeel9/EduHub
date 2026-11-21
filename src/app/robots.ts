import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/join", "/visit"],
        disallow: [
          "/admin",
          "/admin/*",
          "/member",
          "/member/*",
          "/login",
          "/set-password",
          "/api/*",
        ],
      },
    ],
    sitemap: "https://gazaeduhub.com/sitemap.xml",
  };
}
