import type { Metadata } from "next";
import { Jua, Gaegu, Noto_Sans_KR } from "next/font/google";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import PlaylistProvider from "@/components/providers/PlaylistProvider";
import "./globals.css";

const jua = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jua",
  display: "swap",
});

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gaegu",
  display: "swap",
});

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeskLog",
  description: "나만의 파스텔 데스크에서 독서와 집중을 기록하는 공간",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${jua.variable} ${gaegu.variable} ${notoSansKr.variable} antialiased`}>
        <AuthSessionProvider>
          <PlaylistProvider>{children}</PlaylistProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
