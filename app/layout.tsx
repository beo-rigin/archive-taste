import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARCHIVE — 나의 취향',
  description: '나의 시각적 취향을 기록하는 무드보드 아카이브',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
