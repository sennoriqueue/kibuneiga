"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  async function signInEmail() {
    if (!supabase) return
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  async function signUpEmail() {
    if (!supabase) return
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('確認メールを送信しました。受信トレイを確認してください。')
    setLoading(false)
  }

  async function signInOAuth(provider: 'google' | 'twitter') {
    if (!supabase) return
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${siteUrl}` },
    })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold">ログイン / 新規登録</h2>
      <div className="space-y-3">
        {!supabase && (
          <div className="p-3 rounded bg-yellow-100 text-yellow-900 text-sm">
            Supabase の環境変数が未設定です。ログイン機能を使うには `.env.local` に
            NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
          </div>
        )}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <button onClick={signInEmail} disabled={loading || !supabase}>
            メールでログイン
          </button>
          <button onClick={signUpEmail} disabled={loading || !supabase} className="bg-slate-600 hover:bg-slate-500">
            新規登録
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm text-gray-500">ソーシャルログイン</div>
        <div className="flex gap-2">
          <button onClick={() => signInOAuth('google')} disabled={loading || !supabase} className="bg-zinc-800 hover:bg-zinc-700">
            Google で続行
          </button>
          <button onClick={() => signInOAuth('twitter')} disabled={loading || !supabase} className="bg-zinc-800 hover:bg-zinc-700">
            X(Twitter) で続行
          </button>
        </div>
      </div>
      {message && <div className="text-sm text-red-600">{message}</div>}
    </div>
  )
}
