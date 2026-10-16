import { Geist, Geist_Mono } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import "./globals.css";
import "@/styles/responsive.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: { default: "GAPA", template: "%s – GAPA" },
  description: "GAPA — gestão de animais e adoções",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}