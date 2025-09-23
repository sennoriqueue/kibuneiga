"use client"

import { useAuth } from '@/components/auth/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function FavoritesPage() {
  const { user, loading } = useAuth()
  const [items, setItems] = useState<Array<{ id: number; movie_id: number; movie_title: string; poster_path: string | null }>>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    async function fetchFav() {
      if (!supabase || !user) return
      const { data, error } = await supabase
        .from('favorites')
        .select('id, movie_id, movie_title, poster_path')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!active) return
      if (!error && data) setItems(data as any)
    }
    fetchFav()
    return () => {
      active = false
    }
  }, [user])

  async function remove(id: number) {
    if (!supabase) return
    setBusy(true)
    await supabase.from('favorites').delete().eq('id', id)
    setItems((prev) => prev.filter((x) => x.id !== id))
    setBusy(false)
  }

  if (loading) return <div className="text-zinc-400">読み込み中...</div>
  if (!user)
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">お気に入り</h2>
        <p className="text-sm text-zinc-400">お気に入りを見るにはログインしてください。</p>
        <a href="/auth/login" className="underline">ログインページへ</a>
      </div>
    )
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">お気に入り</h2>
      {!supabase ? (
        <p className="text-sm text-zinc-400">Supabase の環境変数が未設定です。</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-400">まだお気に入りはありません。</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((it) => (
            <li key={it.id} className="border border-zinc-800 rounded overflow-hidden bg-zinc-900">
              <a href={`/movies/${it.movie_id}`} className="block">
                {it.poster_path ? (
                  <Image
                    alt={it.movie_title}
                    src={`https://image.tmdb.org/t/p/w342${it.poster_path}`}
                    width={342}
                    height={513}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="aspect-[2/3] bg-zinc-800" />
                )}
                <div className="p-3">
                  <div className="font-semibold text-sm line-clamp-2">{it.movie_title}</div>
                </div>
              </a>
              <div className="p-3 pt-0">
                <button onClick={() => remove(it.id)} disabled={busy} className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded">
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
