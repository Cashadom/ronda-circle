'use client'

import { useEffect, useState } from 'react'
import { getCircleLatestMoments } from '@/lib/circleService'

export default function CircleMomentStrip({ circleId }) {
  const [moments, setMoments] = useState([])

  useEffect(() => {
    if (!circleId) return
    getCircleLatestMoments(circleId, 6)
      .then(setMoments)
      .catch(() => setMoments([]))
  }, [circleId])

  if (moments.length === 0) return null

  return (
    <div className="moment-strip">
      {moments.map((m) => (
        <img
          key={m.id}
          src={m.photoURL}
          alt={m.displayName || ''}
          className="moment-thumb"
          title={m.displayName || ''}
        />
      ))}
    </div>
  )
}