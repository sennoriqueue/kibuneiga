"use client"

import { useMemo } from 'react'

type Props = {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md'
}

export default function StarRating({ value, onChange, readOnly, size = 'md' }: Props) {
  const stars = useMemo(() => [1, 2, 3, 4, 5], [])
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <div className="inline-flex items-center gap-1">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          aria-label={`${s} 星`}
          disabled={readOnly}
          onClick={() => onChange && onChange(s)}
          className={`disabled:cursor-default ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={s <= value ? '#fbbf24' : 'none'}
            stroke={s <= value ? '#fbbf24' : '#71717a'}
            strokeWidth={1.5}
            className={cls}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.73-2.885a.563.563 0 00-.586 0L6.27 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557L2.33 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
        </button>
      ))}
    </div>
  )
}

