const TMDB_API_URL = 'https://api.themoviedb.org/3'

export async function searchByMoodStub(mood?: string) {
  // Placeholder until real TMDb fetch is wired.
  return [{ id: 1, title: `スタブ（${mood ?? '未指定'}）` }]
}

export async function fetchFromTMDb(path: string, params: Record<string, string | number> = {}) {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY is not set')
  const url = new URL(`${TMDB_API_URL}${path}`)
  url.searchParams.set('api_key', apiKey)
  url.searchParams.set('language', 'ja-JP')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url, { next: { revalidate: 60 * 60 } })
  if (!res.ok) throw new Error(`TMDb error: ${res.status}`)
  return res.json()
}

export type TmdbMovie = {
  id: number
  title: string
  original_title?: string
  overview: string
  release_date?: string
  vote_average?: number
  poster_path?: string | null
  original_language?: string
}

export async function discoverByGenres(genreIds: number[], page = 1) {
  const data = await fetchFromTMDb('/discover/movie', {
    with_genres: genreIds.join(','),
    sort_by: 'vote_average.desc',
    'vote_count.gte': 200,
    include_adult: false,
    region: 'JP',
    watch_region: 'JP',
    page,
  })
  return data as { page: number; results: TmdbMovie[] }
}

export async function getMovieDetail(id: string | number) {
  return fetchFromTMDb(`/movie/${id}`, {
    append_to_response: 'videos,watch/providers,credits',
  })
}

export async function getMovieBrief(id: string | number) {
  // Lightweight detail fetch mainly to confirm localized title
  return fetchFromTMDb(`/movie/${id}`, {})
}
