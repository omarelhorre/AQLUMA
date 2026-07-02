import type { Metadata, Viewport } from "next";
import { caveat, didot, satoshi } from "./fonts";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Grid from "@/components/Grid";
import Ambient from "@/components/Ambient";
import PointerGlow from "@/components/PointerGlow";
import Grain from "@/components/Grain";
import Loupe from "@/components/Loupe";
import ContactModal from "@/components/ContactModal";
// Program section is parked (see app/page.tsx). Re-enable with ProgramHighlights/Manifesto.
// import ProgramModal from "@/components/ProgramModal";
import CalInit from "@/components/CalInit";
import WhatsAppFab from "@/components/WhatsAppFab";

const DESCRIPTION =
  "AQLUMA : méthode, pas outil. Une littératie de l'IA, en français et darija.";

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
    icon: [{ url: "/brand/aqluma-mark.png", type: "image/png" }],
    apple: "/brand/aqluma-mark.png",
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
    <html lang="fr" className={`${didot.variable} ${satoshi.variable} ${caveat.variable}`}>
      <body className="bg-void text-cream antialiased">
        <SmoothScroll />
        {/* Blueprint grid — a true backdrop: paints behind <main> (which is
            transparent) over the body's void, so media occludes it. */}
        <Grid />
        {/* Unified ambient lighting + cursor spotlight — site-wide light layers,
            below Grain, above section fills. */}
        <Ambient />
        <PointerGlow />
        {children}
        <Grain />
        <Loupe />
        <ContactModal />
        {/* <ProgramModal /> — parked with the Program section */}
        <CalInit />
        <WhatsAppFab />
      </body>
    </html>
  );
}
