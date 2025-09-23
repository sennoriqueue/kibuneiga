import './globals.css'
import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import HeaderAuth from '@/components/HeaderAuth'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'キブンエイガ | 気分別映画推薦',
  description: '気分に合わせて映画をレコメンドするアプリ',
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-zinc-800 bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                <Link href="/" className="hover:opacity-80">キブンエイガ</Link>
              </h1>
              <nav className="text-sm space-x-4 flex items-center gap-4">
                <a href="/">ホーム</a>
                <a href="/recommendations">おすすめ</a>
                <a href="/favorites">お気に入り</a>
                <HeaderAuth />
              </nav>
            </div>
          </header>
          <Providers>
            <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">{children}</main>
          </Providers>
          <footer className="border-t border-zinc-800 text-sm bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 py-6 text-zinc-400">
              © {new Date().getFullYear()} キブンエイガ
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
