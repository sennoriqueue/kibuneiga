"use client"

import { useState } from 'react'
import ReviewForm from './ReviewForm'
import ReviewsList from './ReviewsList'

export default function ReviewsSection({ movieId }: { movieId: number }) {
  const [revKey, setRevKey] = useState(0)
  return (
    <section className="mt-6 space-y-4">
      <ReviewForm movieId={movieId} onChanged={() => setRevKey((k) => k + 1)} />
      <ReviewsList movieId={movieId} refreshKey={revKey} />
    </section>
  )
}

