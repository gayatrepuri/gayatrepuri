import type { Metadata } from "next";
import { Archivo, Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site";
import "./globals.css";

// Fonts: Archivo (headings), Instrument Sans (body), Instrument Serif italic (accent words), JetBrains Mono (numbers).
const body = Instrument_Sans({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600"] });
const display = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const accent = Instrument_Serif({ variable: "--font-instrument-serif", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ variable: "--font-jb-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: site.name,
  description: site.shortDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${body.variable} ${display.variable} ${accent.variable} ${mono.variable} h-full antialiased`}>
      <head>
        {/* Marks that JavaScript runs, so scroll-in effects never hide content when it doesn't. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
