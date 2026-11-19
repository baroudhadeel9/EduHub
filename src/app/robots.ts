import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gazaeduhub.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/join", "/visit", "/login"],
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/member",
          "/member/*",
          "/set-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
