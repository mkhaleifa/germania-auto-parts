import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Germania Auto Parts — German Parts, Clearly Sourced",
    template: "%s | Germania Auto Parts",
  },
  description:
    "Premium German-market auto parts in EUR. OEM and quality aftermarket parts for Mercedes-Benz, BMW, Audi, Volkswagen, Porsche and more.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Germania Auto Parts",
    title: "Germania Auto Parts — German Parts, Clearly Sourced",
    description:
      "Premium German-market auto parts, inspected and shipped worldwide.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Germania Auto Parts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Germania Auto Parts — German Parts, Clearly Sourced",
    description: "Premium German-market auto parts shipped worldwide.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
