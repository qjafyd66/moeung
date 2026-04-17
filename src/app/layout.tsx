import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "모응 - 자동차 시승 이벤트를 한곳에",
  description: "현대, 기아, BMW, 벤츠, 테슬라 등 자동차 브랜드 공식 시승 이벤트 모음",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
