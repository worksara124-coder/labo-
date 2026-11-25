import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.fullName} — Laboratoire de prothèse dentaire à ${SITE.city}`,
  description: `${SITE.fullName}, laboratoire de prothèse dentaire à ${SITE.city} : couronnes zircone, céramique, prothèse sur implants, amovible et flux numérique CFAO. Prise de rendez-vous en ligne pour les chirurgiens-dentistes.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
