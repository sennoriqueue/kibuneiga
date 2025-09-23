"use client"

import { create } from 'zustand'
import type { Mood, Situation } from '@/types/mood'

type State = {
  mood: Mood | null
  situation: Situation | null
}

type Actions = {
  setMood: (m: Mood) => void
  setSituation: (s: Situation) => void
  reset: () => void
}

export const useMoodStore = create<State & Actions>((set) => ({
  mood: null,
  situation: null,
  setMood: (m) => set({ mood: m }),
  setSituation: (s) => set({ situation: s }),
  reset: () => set({ mood: null, situation: null }),
}))

