import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/collection",
    "/collection/shoes/ivory-gold-bit-mule",
    "/collection/shoes/noir-minimal-mule",
    "/collection/shoes/camel-suede-mule",
    "/collection/shoes/espresso-horsebit-mule",
    "/contact",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/returns-policy",
    "/shipping-policy",
    "/payment-policy",
    "/customize/ivory-gold-bit-mule",
    "/login",
    "/register",
    "/cart",
    "/wishlist",
    "/checkout",
    "/account/orders",
  ];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
