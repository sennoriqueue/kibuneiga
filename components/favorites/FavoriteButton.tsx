"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/auth/AuthContext'

type Props = {
  movieId: number
  title: string
  posterPath?: string | null
}

export default function FavoriteButton({ movieId, title, posterPath }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [exists, setExists] = useState(false)
  const disabled = !user || !supabase || loading

  useEffect(() => {
    let active = true
    async function fetchExists() {
      if (!supabase || !user) return
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .limit(1)
        .maybeSingle()
      if (!active) return
      setExists(Boolean(data))
    }
    fetchExists()
    return () => {
      active = false
    }
  }, [movieId, user])

  async function toggleFavorite() {
    if (!supabase || !user) return
    setLoading(true)
    try {
      if (exists) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId)
        setExists(false)
      } else {
        await supabase.from('favorites').insert({
          user_id: user.id,
          movie_id: movieId,
          movie_title: title,
          poster_path: posterPath ?? null,
        })
        setExists(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <a href="/auth/login" className="inline-block text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
        ログインしてお気に入り
      </a>
    )
  }

  return (
    <button onClick={toggleFavorite} disabled={disabled} className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
      {exists ? 'お気に入り済み' : 'お気に入りに追加'}
    </button>
  )
}

