import { describe, it, expect } from 'vitest'
import { moods, situations } from '@/types/mood'

describe('mood and situation presets', () => {
  it('includes required moods', () => {
    for (const m of ['楽しい', '悲しい', '興奮', 'リラックス', 'ロマンチック', 'スリル']) {
      expect(moods).toContain(m)
    }
  })

  it('includes required situations', () => {
    for (const s of ['一人', 'カップル', '家族', '友達']) {
      expect(situations).toContain(s)
    }
  })
})

