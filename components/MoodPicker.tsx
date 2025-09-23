"use client"

import { useRouter } from 'next/navigation'
import { moods, situations, Mood, Situation } from '@/types/mood'
import { useMoodStore } from '@/stores/moodStore'
import { useCallback } from 'react'

export default function MoodPicker() {
  const router = useRouter()
  const { mood, situation, setMood, setSituation } = useMoodStore()

  const gotoRecommend = useCallback(() => {
    const params = new URLSearchParams()
    if (mood) params.set('mood', mood)
    if (situation) params.set('situation', situation)
    router.push(`/recommendations?${params.toString()}`)
  }, [router, mood, situation])

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-semibold mb-2">いまの気分</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m as Mood)}
              className={
                'px-3 py-2 rounded border transition-colors ' +
                (mood === m
                  ? 'bg-slate-700 text-zinc-100 border-slate-600'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800')
              }
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">視聴シチュエーション</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {situations.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSituation(s as Situation)}
              className={
                'px-3 py-2 rounded border transition-colors ' +
                (situation === s
                  ? 'bg-slate-700 text-zinc-100 border-slate-600'
                  : 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:bg-zinc-800')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="button" onClick={gotoRecommend} disabled={!mood}>
          クイック推薦
        </button>
        <span className="text-sm text-zinc-400">気分を選ぶと押せます</span>
      </div>
    </div>
  )
}
