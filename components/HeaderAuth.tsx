"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { supabase } from '@/lib/supabaseClient'

export default function HeaderAuth() {
  const { user, loading } = useAuth()

  const baseName = (user?.user_metadata && (user.user_metadata.full_name || user.user_metadata.name)) as
    | string
    | undefined
  const fallbackName = user ? baseName || user.email || 'ユーザー' : null
  const [displayName, setDisplayName] = useState<string | null>(fallbackName ?? null)

  useEffect(() => {
    let active = true
    async function load() {
      if (!user) {
        setDisplayName(null)
        return
      }
      // set fallback immediately
      setDisplayName(fallbackName ?? 'ユーザー')
      // try to load nickname if supabase is configured
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', user.id)
          .limit(1)
          .maybeSingle()
        if (!active) return
        const nick = (data as any)?.nickname as string | null
        if (nick) setDisplayName(nick)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [user])

  if (loading) return <div className="text-sm text-zinc-400">...</div>
  if (!user)
    return (
      <Link className="text-sm underline" href="/auth/login">
        ログイン/登録
      </Link>
    )
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="truncate max-w-[10rem]">{displayName ?? 'ユーザー'}</span>
      <button onClick={() => useAuth().signOut()} className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600">
        ログアウト
      </button>
    </div>
  )
}
