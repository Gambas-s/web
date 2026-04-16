import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "감바쓰",
  description: "나쁜 감정은 쓰레기통으로!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
