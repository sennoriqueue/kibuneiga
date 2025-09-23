import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mood = searchParams.get('mood') ?? undefined

  const samples = [
    {
      id: 1,
      title: 'サンプル・ムービーA',
      rating: 4.2,
      year: 2019,
      overview: 'スタブデータ（TMDb 連携前）',
    },
    {
      id: 2,
      title: 'サンプル・ムービーB',
      rating: 3.9,
      year: 2021,
      overview: '推奨アルゴリズム実装前の結果',
    },
  ]

  const data = mood ? samples.map((s) => ({ ...s, title: `${s.title}（${mood}向け）` })) : samples
  return NextResponse.json({ results: data })
}

