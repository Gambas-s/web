import type { Metadata } from "next";
import "./globals.css";
import { Agentation } from "agentation";

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
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
          {children}
          {process.env.NODE_ENV === "development" && <Agentation endpoint="http://localhost:4747" />}
        </body>
    </html>
  );
}
