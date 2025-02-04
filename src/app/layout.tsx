import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tool Manager - Professional Tool Management Solution",
  description: "Streamline your tool management process with our comprehensive solution. Track, maintain, and optimize your tool inventory effortlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}
