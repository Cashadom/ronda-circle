'use client'

import './WeeklyMoment.css'

export default function WeeklyMomentCard({
  moment,
  currentUserId,
  onDelete,
}) {
  const isOwner = moment.uid === currentUserId

  return (
    <div className="weekly-moment-card">
      <img
        src={moment.photoURL}
        alt={moment.displayName}
      />

      <div className="weekly-moment-card-footer">
        <span className="weekly-moment-author">
          {moment.displayName}
        </span>

        {isOwner && (
          <button
            className="weekly-moment-delete"
            onClick={() => onDelete(moment.id)}
            title="Delete photo"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}