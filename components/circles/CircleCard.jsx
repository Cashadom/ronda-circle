import Link from 'next/link'
import { getCircleType } from '@/lib/circles'
import './CircleCard.css'

export default function CircleCard({ circle }) {
  const type = getCircleType(circle.type)
  const count = Number(circle.members_count || 0)
  const capacity = Number(circle.capacity || 12)

  return (
    <article className="circle-card">
      <div className="card-body">
        <div className="card-row card-row-top">
          <div className="card-left">
            <span className="card-title">{circle.title || 'Nom du groupe'}</span>
          </div>
          <span className="card-category">{type.label}</span>
        </div>

        <div className="card-row">
          <div className="card-left">
            <span className="card-text">⚲ {circle.city || 'city (optionnel)'}</span>
          </div>
          <span className="card-members">{count} / {capacity} members</span>
        </div>

        <div className="card-row card-row-bottom">
          <div className="card-left">
            <span className="card-text">Created by {circle.created_by_name || 'Anonymous'}</span>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Link href={`/circles/${circle.id}`} className="btn-join">
          Join
        </Link>
      </div>
    </article>
  )
}