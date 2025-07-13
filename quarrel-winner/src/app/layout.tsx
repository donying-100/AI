import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '吵架包赢 - AI智能吵架助手',
  description: '输入对方的话，选择语气强度，AI帮你生成完美的反击回复！',
  keywords: '吵架,反击,AI助手,智能回复',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}