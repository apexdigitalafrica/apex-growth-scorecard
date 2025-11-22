// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Apex Growth Scorecard",
    short_name: "Apex Scorecard",
    description:
      "Advanced digital growth analytics for African SaaS & SMEs. Track digital maturity, optimise funnels, and accelerate growth.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: "#0A0F1F",
    theme_color: "#0A0F1F",
    orientation: "portrait-primary",
    lang: "en-GB",
    categories: ["business", "productivity", "analytics"],

    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/maskable-192x192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/maskable-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],

    shortcuts: [
      {
        name: "Run Scorecard",
        short_name: "Scorecard",
        description: "Start a new growth scorecard assessment",
        url: "/scorecard",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Funnel Analysis",
        short_name: "Funnels",
        description: "Analyse conversion funnels",
        url: "/client-portal/funnel-analysis",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Client Dashboard",
        short_name: "Dashboard",
        description: "Open your enterprise portal",
        url: "/client-portal/dashboard",
        icons: [{ src: "/android-chrome-192x192.png", sizes: "192x192" }],
      },
    ],

    screenshots: [
      {
        src: "/screenshots/scorecard-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Growth Scorecard",
      },
      {
        src: "/screenshots/dashboard-1.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Client Portal Dashboard",
      },
    ],
  };
}
