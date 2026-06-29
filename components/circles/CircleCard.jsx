import Link from 'next/link'
import { getCircleType } from '@/lib/circles'
import './CircleCard.css'

export default function CircleCard({ circle }) {
  const type = getCircleType(circle.type)
  const count = Number(circle.members_count || 0)
  const capacity = Number(circle.capacity || 12)
  const creatorName = circle.created_by_name || 'Anonymous'
  const creatorInitial = creatorName.charAt(0)

  return (
    <article className="circle-card">
      <div className="card-body">
        <div className="card-row-top">
          <span className="card-title">{circle.title || 'Nom du groupe'}</span>
          <span className="card-category">{type.label}</span>
        </div>

        <div className="card-row-meta">
          <span className="card-city">⚲ {circle.city || 'City'}</span>
          <span className="card-members">{count} / {capacity} members</span>
        </div>

        {circle.description && (
          <p className="card-description">{circle.description}</p>
        )}
      </div>

      <div className="card-footer">
        <div className="card-creator">
          <span className="creator-avatar">{creatorInitial}</span>
          <span className="creator-name">Created by {creatorName}</span>
        </div>

        <Link href={`/circles/${circle.id}`} className="btn-join">
          Join
        </Link>
      </div>
    </article>
  )
}