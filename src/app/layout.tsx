import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR, Gaegu, Caveat } from "next/font/google";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import PlaylistProvider from "@/components/providers/PlaylistProvider";
import AsmrPlayerProvider from "@/components/providers/AsmrPlayerProvider";
import FocusTimerProvider from "@/components/providers/FocusTimerProvider";
import FloatingControlBar from "@/components/layout/FloatingControlBar";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-title",
  display: "swap",
});

const gaegu = Gaegu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-hand-kr",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-hand-en",
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
      <body className={`${notoSansKr.variable} ${notoSerifKr.variable} ${gaegu.variable} ${caveat.variable} antialiased`}>
        <AuthSessionProvider>
          <PlaylistProvider>
            <AsmrPlayerProvider>
              <FocusTimerProvider>
                {children}
                <FloatingControlBar />
              </FocusTimerProvider>
            </AsmrPlayerProvider>
          </PlaylistProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
