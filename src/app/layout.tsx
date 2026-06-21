import type { Metadata } from "next";
import { Noto_Sans_KR, Jua } from "next/font/google";
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

const jua = Jua({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-title",
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
      <body className={`${notoSansKr.variable} ${jua.variable} antialiased`}>
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
