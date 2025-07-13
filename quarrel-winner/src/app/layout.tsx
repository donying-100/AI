import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "吵架包赢 - AI智能反击助手",
  description: "输入对方的话，AI帮你生成完美的反击回复",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}