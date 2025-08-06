import type { Metadata } from "next";
import { Roboto, Roboto_Slab } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lowcountry Swing Beds - Customer Assistant",
  description: "Get instant help with our premium handcrafted swing beds from Charleston, SC. Ask about sizing, installation, pricing, and find your perfect outdoor relaxation solution.",
  keywords: "swing beds, outdoor furniture, porch swings, Charleston furniture, handcrafted beds, custom swing beds",
  authors: [{ name: "Lowcountry Swing Beds" }],
  creator: "Lowcountry Swing Beds",
  publisher: "Lowcountry Swing Beds",
  robots: "index, follow",
  openGraph: {
    title: "Lowcountry Swing Beds - Customer Assistant",
    description: "Get instant help with our premium handcrafted swing beds from Charleston, SC.",
    url: "https://lcswingbeds.com",
    siteName: "Lowcountry Swing Beds",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Lowcountry Swing Beds Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lowcountry Swing Beds - Customer Assistant",
    description: "Get instant help with our premium handcrafted swing beds from Charleston, SC.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  manifest: "/site.webmanifest",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#FFE3C6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${roboto.variable} ${robotoSlab.variable} antialiased bg-white text-[#141718] font-['Roboto',sans-serif]`}
      >
        {children}
      </body>
    </html>
  );
}