"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/auth/AuthContext'
import StarRating from './StarRating'

type Props = {
  movieId: number
  onChanged?: () => void
}

export default function ReviewForm({ movieId, onChanged }: Props) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasExisting, setHasExisting] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!supabase || !user) return
      const { data } = await supabase
        .from('reviews')
        .select('id, rating, content')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .limit(1)
        .maybeSingle()
      if (!mounted) return
      if (data) {
        setHasExisting(true)
        setRating(data.rating)
        setContent(data.content ?? '')
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [movieId, user])

  async function save() {
    if (!supabase || !user) return
    setLoading(true)
    try {
      await supabase
        .from('reviews')
        .upsert(
          {
            user_id: user.id,
            movie_id: movieId,
            rating,
            content,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,movie_id' },
        )
      setHasExisting(true)
      onChanged?.()
    } finally {
      setLoading(false)
    }
  }

  async function remove() {
    if (!supabase || !user) return
    setLoading(true)
    try {
      await supabase
        .from('reviews')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
      setHasExisting(false)
      setContent('')
      setRating(5)
      onChanged?.()
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="p-3 rounded bg-zinc-900 border border-zinc-800">
        <div className="text-sm text-zinc-300 mb-2">レビューを投稿するにはログインしてください。</div>
        <a href="/auth/login" className="underline text-indigo-300">ログインページへ</a>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3 rounded bg-zinc-900 border border-zinc-800">
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">評価</span>
        <StarRating value={rating} onChange={(v) => setRating(v)} />
        <span className="text-sm text-zinc-400">{rating}/5</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="感想を入力（任意）"
        className="w-full"
      />
      <div className="flex items-center gap-2">
        <button onClick={save} disabled={loading}>
          {hasExisting ? 'レビューを更新' : 'レビューを投稿'}
        </button>
        {hasExisting && (
          <button onClick={remove} disabled={loading} className="bg-zinc-700 hover:bg-zinc-600">
            削除
          </button>
        )}
      </div>
    </div>
  )
}
