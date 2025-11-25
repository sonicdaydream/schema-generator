import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "構造化データ自動生成ツール",
  description: "URLを入力するだけで最適な構造化データ(JSON-LD)を自動生成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
