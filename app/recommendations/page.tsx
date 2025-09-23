import { Suspense } from 'react'
import Image from 'next/image'
import { moodToGenres } from '@/lib/moodMap'
import { discoverByGenres, type TmdbMovie } from '@/lib/tmdb'
import { hasJapanese } from '@/lib/japanese'
import RefreshControls from '@/components/recommend/RefreshControls'

export default function RecommendationsPage({
  searchParams,
}: {
  searchParams: { mood?: string; situation?: string; p?: string }
}) {
  const { mood, situation, p } = searchParams
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">おすすめ</h2>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          {mood ? `気分: ${mood}` : '気分未選択'} / {situation ? `シチュエーション: ${situation}` : 'シチュ未選択'}
        </p>
        <RefreshControls />
      </div>
      <Suspense fallback={<div>読み込み中...</div>}>
        <Results mood={mood} situation={situation} pageParam={p} />
      </Suspense>
    </div>
  )
}

async function Results({ mood, situation, pageParam }: { mood?: string; situation?: string; pageParam?: string }) {
  try {
    const genreIds = mood ? moodToGenres[mood] ?? [] : []
    const page = Number(pageParam ?? '1') || 1
    if (!genreIds.length) {
      return <div className="text-sm text-gray-500">条件に合う映画を探すには気分を選択してください。</div>
    }
    const data = await discoverByGenres(genreIds, page)
    const results = data.results
      .filter((m) => hasJapanese(m.title) && hasJapanese(m.overview))
      .slice(0, 3)
    const params = new URLSearchParams()
    if (mood) params.set('mood', mood)
    if (situation) params.set('situation', situation)
    params.set('p', String(page))
    const qs = params.toString()
    return <MovieGrid movies={results} qs={qs ? `?${qs}` : ''} />
  } catch (e) {
    return (
      <div className="text-sm text-gray-600">
        TMDb の設定が未完了のためスタブ表示です。環境変数 `TMDB_API_KEY` を設定してください。
      </div>
    )
  }
}

function MovieGrid({ movies, qs }: { movies: TmdbMovie[]; qs: string }) {
  if (!movies?.length)
    return <div className="text-sm text-gray-500">条件に合う映画が見つかりませんでした。</div>
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {movies.map((m) => (
        <li key={m.id} className="border border-zinc-800 rounded overflow-hidden bg-zinc-900">
          <a href={`/movies/${m.id}${qs}`} className="block">
            {m.poster_path ? (
              <Image
                alt={m.title}
                src={`https://image.tmdb.org/t/p/w342${m.poster_path}`}
                width={342}
                height={513}
                className="w-full h-auto"
              />
            ) : (
              <div className="aspect-[2/3] bg-zinc-800" />
            )}
            <div className="p-3">
              <div className="font-semibold text-sm line-clamp-2">{m.title}</div>
              <div className="text-xs text-zinc-400">⭐{m.vote_average?.toFixed(1) ?? '-'} / {m.release_date?.slice(0, 4) ?? '-'}</div>
              <p className="text-xs mt-2 line-clamp-3 text-zinc-300">{m.overview}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}

