import type { Metadata, Viewport } from "next";
import { didot } from "./fonts";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Grain from "@/components/Grain";
import Cursor from "@/components/Cursor";

export const metadata: Metadata = {
  title: "AQLUMA",
  description:
    "AQLUMA — méthode, pas outil. Une littératie de l'IA, en français et darija.",
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
      </body>
    </html>
  );
}
