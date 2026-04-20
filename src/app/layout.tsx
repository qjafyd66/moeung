import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "모응 - 이벤트 모아보기",
  description: "시승·체험·응모 이벤트를 한 곳에서. 자동차, 가전, 라이프스타일 브랜드의 이벤트를 마감일 순으로 확인하세요.",
  metadataBase: new URL("https://www.moeung.kr"),
  openGraph: {
    type: "website",
    url: "https://www.moeung.kr",
    siteName: "모응",
    title: "모응 - 이벤트 모아보기",
    description: "시승·체험·응모 이벤트를 한 곳에서. 자동차, 가전, 라이프스타일 브랜드의 이벤트를 마감일 순으로 확인하세요.",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "모응 - 이벤트 모아보기",
    description: "시승·체험·응모 이벤트를 한 곳에서. 자동차, 가전, 라이프스타일 브랜드의 이벤트를 마감일 순으로 확인하세요.",
  },
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
