import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SidebarLayout from "@/components/sidebar-layout";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Resell OS",
  description: "Dein Resell-Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
