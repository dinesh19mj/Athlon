import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import StoreProvider from "@/components/providers/StoreProvider";
import { AntdProvider } from "@/components/providers/AntdProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Athlon Tournament Portal",
  description: "The tournament experience, elevated.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0E1420",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <AntdProvider>
            {children}
          </AntdProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
