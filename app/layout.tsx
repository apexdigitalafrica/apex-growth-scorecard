// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "./pwa-register";
import PWAUpdater from "./pwa-updater";
import PWAInstallPrompt from "./pwa-install";
import PwaInstallButton from '@/components/PwaInstallButton';



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Apex Growth Scorecard | Digital Growth Analytics Platform",
    template: "%s | Apex Growth Scorecard",
  },
  description:
    "Advanced digital growth analytics and scorecard platform for businesses. Track digital maturity, optimise funnels, and accelerate growth with AI-powered insights.",
  keywords: [
    "growth analytics",
    "digital scorecard",
    "business intelligence",
    "funnel optimisation",
    "digital maturity",
    "African SaaS growth",
  ],
  authors: [{ name: "Apex Digital Africa" }],
  creator: "Apex Digital Africa",
  publisher: "Apex Digital Africa",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Apex Growth Scorecard",
    description:
      "Advanced digital growth analytics and scorecard platform for businesses.",
    siteName: "Apex Growth Scorecard",
    images: [
      {
        url: "/og-image.png", // put your OG image in /public/og-image.png
        width: 1200,
        height: 630,
        alt: "Apex Growth Scorecard",
      },
    ],
    locale: "en_GB",
  },

  twitter: {
    card: "summary_large_image",
    title: "Apex Growth Scorecard",
    description:
      "Advanced digital growth analytics and scorecard platform for businesses.",
    images: ["/og-image.png"],
    creator: "@ApexDigitalAfrica",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-touch-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-touch-icon-167x167.png", sizes: "167x167" },
      { url: "/apple-touch-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      { rel: "mask-icon", url: "/maskable-512x512.png", color: "#0A0F1F" },
    ],
  },

  manifest: "/manifest.webmanifest", // Next will serve app/manifest.ts as this
};

export const viewport: Viewport = {
  themeColor: "#0A0F1F",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <head>
        {/* iOS status bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Apex Scorecard" />

        {/* iOS Splash screens (see section 5 for files) */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-14-pro-max.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-14-pro.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-13-12.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/iphone-se.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/ipad.png"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
  <PWARegister />
  <PWAUpdater />
  <PWAInstallPrompt />
  <PwaInstallButton />
  {children}
</body>
    </html>
  );
}
