import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare, GeistPixelTriangle } from "geist/font/pixel";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CommandPalette } from "@/components/CommandPalette";
import { DialogueOverlay } from "@/components/DialogueOverlay";
import { PanelHost } from "@/components/PanelHost";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nuu.community";

export const viewport: Viewport = {
  themeColor: "#f4e8c8",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "nuu — your move.",
    template: "%s — nuu",
  },
  description:
    "A community of Mongolian builders, breakers, and shippers — scattered across the world, gathered here. Нүү — make your move.",
  keywords: [
    "mongolian",
    "diaspora",
    "community",
    "builders",
    "developers",
    "designers",
    "tech",
    "sydney",
    "ulaanbaatar",
    "pixel art",
    "shatar",
  ],
  authors: [{ name: "Obi Batbileg", url: "https://obicreative.dev" }],
  creator: "Obi Batbileg",
  publisher: "nuu",
  applicationName: "nuu",
  category: "community",
  alternates: { canonical: "/" },
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "/",
    siteName: "nuu",
    title: "nuu — your move.",
    description:
      "A community of Mongolian builders, breakers, and shippers — scattered across the world, gathered here.",
  },
  twitter: {
    card: "summary_large_image",
    title: "nuu — your move.",
    description:
      "A community of Mongolian builders, breakers, and shippers.",
    creator: "@obicreative",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "nuu",
  alternateName: "Нүү",
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
  description:
    "A community of Mongolian builders, breakers, and shippers — scattered across the world, gathered here.",
  founder: {
    "@type": "Person",
    name: "Obi Batbileg",
    url: "https://obicreative.dev",
  },
  sameAs: [
    "https://obicreative.dev",
    "https://craefto.com",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} ${GeistPixelTriangle.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <CommandPalette />
        <DialogueOverlay />
        <PanelHost />
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </body>
    </html>
  );
}
