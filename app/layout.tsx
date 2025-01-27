import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Two finger pan zoom and pinch in React",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-svh">
      <body className="h-full">{children}</body>
    </html>
  );
}
