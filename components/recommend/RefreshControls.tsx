"use client"

import { useSearchParams, useRouter } from 'next/navigation'

export default function RefreshControls() {
  const sp = useSearchParams()
  const router = useRouter()
  const mood = sp.get('mood') || undefined
  const situation = sp.get('situation') || undefined
  const p = Number(sp.get('p') || '1') || 1

  const refresh = () => {
    const next = (p % 5) + 1 // cycle 1..5
    const params = new URLSearchParams()
    if (mood) params.set('mood', mood)
    if (situation) params.set('situation', situation)
    params.set('p', String(next))
    router.replace(`/recommendations?${params.toString()}`)
  }

  return (
    <button onClick={refresh} className="text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
      リフレッシュ
    </button>
  )
}

