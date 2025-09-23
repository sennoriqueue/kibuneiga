export function hasJapanese(text: string | null | undefined): boolean {
  if (!text) return false
  // Hiragana, Katakana, Kanji, iteration marks
  return /[\u3040-\u30FF\u4E00-\u9FAF\u3400-\u4DBF\u3005\u3007\u303B]/.test(text)
}

