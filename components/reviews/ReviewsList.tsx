"use client"

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import StarRating from './StarRating'
import { useAuth } from '@/components/auth/AuthContext'

type Item = {
  id: number
  user_id: string
  movie_id: number
  rating: number
  content: string | null
  created_at: string
  updated_at: string
}

export default function ReviewsList({ movieId, refreshKey = 0 }: { movieId: number; refreshKey?: number }) {
  const { user } = useAuth()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [names, setNames] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true
    async function load() {
      if (!supabase) return
      setLoading(true)
      const { data } = await supabase
        .from('reviews')
        .select('id, user_id, movie_id, rating, content, created_at, updated_at')
        .eq('movie_id', movieId)
        .order('updated_at', { ascending: false })
      if (!active) return
      const rows = ((data as any) || []) as Item[]
      setItems(rows)
      // fetch nicknames
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)))
      if (userIds.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, nickname')
          .in('id', userIds)
        const map: Record<string, string> = {}
        for (const p of (profs as any) || []) {
          if (p.nickname) map[p.id] = p.nickname as string
        }
        if (active) setNames(map)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [movieId, refreshKey])

  const avg = useMemo(() => {
    if (!items.length) return null
    const s = items.reduce((a, b) => a + (b.rating || 0), 0)
    return Math.round((s / items.length) * 10) / 10
  }, [items])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-sm text-zinc-400">レビュー</div>
        {avg !== null && (
          <div className="flex items-center gap-2 text-sm">
            <StarRating value={Math.round(avg)} readOnly size="sm" />
            <span className="text-zinc-300">{avg} / 5</span>
            <span className="text-zinc-500">({items.length}件)</span>
          </div>
        )}
      </div>
      {loading ? (
        <div className="text-sm text-zinc-500">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-zinc-500">まだレビューはありません。</div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="border border-zinc-800 rounded p-3 bg-zinc-900">
              <div className="flex items-center justify-between">
                <StarRating value={r.rating} readOnly size="sm" />
                <div className="text-xs text-zinc-500 flex items-center gap-2">
                  <span>{names[r.user_id] || '匿名'}</span>
                  {user?.id === r.user_id && <span>（あなた）</span>}
                </div>
              </div>
              {r.content && <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{r.content}</p>}
              <div className="text-xs text-zinc-500 mt-2">{formatDate(r.updated_at)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}
