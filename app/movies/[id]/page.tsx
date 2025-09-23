import Image from 'next/image'
import { getMovieDetail } from '@/lib/tmdb'
import { createProviderLinks } from '@/lib/providerLinks'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import ReviewsSection from '@/components/reviews/ReviewsSection'

export default async function MovieDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { mood?: string; situation?: string; p?: string }
}) {
  const { id } = params
  const { mood, situation, p } = searchParams
  const backParams = new URLSearchParams()
  if (mood) backParams.set('mood', mood)
  if (situation) backParams.set('situation', situation)
  if (p) backParams.set('p', p)
  const backHref = `/recommendations${backParams.toString() ? `?${backParams}` : ''}`
  try {
    const data: any = await getMovieDetail(id)
    const year = data.release_date?.slice(0, 4) ?? '-'
    const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name ?? '-'
    const cast = (data.credits?.cast ?? []).slice(0, 3).map((c: any) => c.name).join('、')
    const trailer = (data.videos?.results ?? []).find(
      (v: any) => v.site === 'YouTube' && v.type === 'Trailer',
    )
    const providersJP = data['watch/providers']?.results?.JP ?? {}
    const providerSet: any[] = Array.from(
      new Map(
        ([...(providersJP.flatrate ?? []), ...(providersJP.rent ?? []), ...(providersJP.buy ?? [])] as any[]).map(
          (p) => [p.provider_id, p],
        ),
      ).values(),
    )
    const links = createProviderLinks(data.title, providerSet)
    return (
      <div className="space-y-4">
        <div>
          <a href={backHref} className="inline-block text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
            おすすめ一覧へ戻る
          </a>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl font-bold">{data.title}</h2>
          <FavoriteButton movieId={data.id} title={data.title} posterPath={data.poster_path} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.poster_path ? (
            <Image
              alt={data.title}
              src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
              width={500}
              height={750}
              className="w-full h-auto rounded"
            />
          ) : (
            <div className="aspect-[2/3] bg-zinc-800 rounded" />
          )}
          <div>
            <div className="space-y-2 text-sm">
              <div>制作年: {year}</div>
              <div>監督: {director}</div>
              <div>主演: {cast || '-'}</div>
              <div>評価: ⭐{data.vote_average?.toFixed(1) ?? '-'}</div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold">あらすじ</h3>
              <p className="text-sm text-zinc-300">{data.overview || 'なし'}</p>
            </div>
            {links.length ? (
              <div className="mt-4">
                <h3 className="font-semibold">配信プラットフォーム（日本）</h3>
                <ul className="list-disc pl-5 text-sm text-zinc-300">
                  {links.map((l) => (
                    <li key={l.name}>
                      <a href={l.url} target="_blank" rel="noreferrer" className="underline">
                        {l.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
      </div>
      {trailer ? (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">予告編</h3>
          <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}
        <ReviewsSection movieId={data.id} />
      </div>
    )
  } catch (e) {
    return (
      <div className="space-y-4">
        <div>
          <a href={backHref} className="inline-block text-sm bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded">
            おすすめ一覧へ戻る
          </a>
        </div>
        <h2 className="text-2xl font-bold">映画詳細（ID: {id}）</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">TMDb 設定前の仮ページです。</p>
      </div>
    )
  }
}
