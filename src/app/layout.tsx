import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MANADA CLUB - Entrenamiento Canino",
  description: "Transforma la vida de tu perro con el método MANADA. Entrenamiento de élite y apego seguro.",
  openGraph: {
    title: "MANADA CLUB - Entrenamiento Canino",
    description: "Plataforma de entrenamiento canino basada en el método MANADA.",
    url: "https://mc26-ia-studio.vercel.app",
    siteName: "MANADA CLUB",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "MANADA CLUB Logo",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MANADA CLUB",
    description: "Entrenamiento canino de élite.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
