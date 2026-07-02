'use client'

import WeeklyMomentCard from './WeeklyMomentCard'
import './WeeklyMoment.css'

export default function WeeklyMomentGrid({
  moments,
  loading,
  currentUserId,
  onLike,
  onDelete,
}) {
  if (loading) {
    return <p className="weekly-moment-loading">Loading moments...</p>
  }

  if (moments.length === 0) {
    return (
      <div className="weekly-moment-empty">
        No moments yet. Be the first 
      </div>
    )
  }

  return (
    <div className="weekly-moment-grid">
      {moments.map((moment) => (
        <WeeklyMomentCard
          key={moment.id}
          moment={moment}
          currentUserId={currentUserId}
          onLike={onLike}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}