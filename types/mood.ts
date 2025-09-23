export const moods = [
  '楽しい',
  '悲しい',
  '興奮',
  'リラックス',
  'ロマンチック',
  'スリル',
] as const

export type Mood = (typeof moods)[number]

export const situations = ['一人', 'カップル', '家族', '友達'] as const
export type Situation = (typeof situations)[number]

