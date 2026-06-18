import type { Metadata, Viewport } from "next";
import { didot } from "./fonts";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Grain from "@/components/Grain";
import Cursor from "@/components/Cursor";
import ContactModal from "@/components/ContactModal";

const DESCRIPTION =
  "AQLUMA — méthode, pas outil. Une littératie de l'IA, en français et darija.";

export const metadata: Metadata = {
  // TODO: set to the real production domain so OG/Twitter image URLs resolve.
  metadataBase: new URL("https://aqluma.com"),
  title: {
    default: "AQLUMA",
    template: "%s · AQLUMA",
  },
  description: DESCRIPTION,
  applicationName: "AQLUMA",
  icons: {
    icon: [
      { url: "/brand/aqluma-logo.svg", type: "image/svg+xml" },
      { url: "/brand/aqluma-logo.png", type: "image/png" },
    ],
    apple: "/brand/aqluma-logo.png",
  },
  openGraph: {
    type: "website",
    siteName: "AQLUMA",
    title: "AQLUMA",
    description: DESCRIPTION,
    locale: "fr_FR",
    images: [{ url: "/musee-aqluma-panorama.jpg", alt: "AQLUMA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AQLUMA",
    description: DESCRIPTION,
    images: ["/musee-aqluma-panorama.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#080A0C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={didot.variable}>
      <body className="bg-void text-cream antialiased">
        <SmoothScroll />
        {children}
        <Grain />
        <Cursor />
        <ContactModal />
      </body>
    </html>
  );
}
