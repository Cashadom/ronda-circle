import Link from 'next/link'
import { getCircleType } from '@/lib/circles'
import './CircleCard.css'

export default function CircleCard({ circle }) {
  const type = getCircleType(circle.type)
  const count = Number(circle.members_count || 0)
  const capacity = Number(circle.capacity || 12)
  const isFull = count >= capacity
  const creatorName = circle.created_by_name || 'Anonymous'
  const creatorInitial = creatorName.charAt(0).toUpperCase()

  return (
    <article className="circle-card">
      <div className="card-body">
        {/* ─── Titre + Catégorie ─── */}
        <div className="card-row-top">
          <h3 className="card-title">{circle.title || 'Untitled circle'}</h3>
          <span className="card-category">{type?.label || 'Circle'}</span>
        </div>

        {/* ─── Ville + Membres ─── */}
        <div className="card-row-meta">
          <span className="card-city">⚲ {circle.city || 'Remote'}</span>
          <span className="card-members">{count} / {capacity}</span>
        </div>

        {/* ─── Description ─── */}
        {circle.description && (
          <p className="card-description">
            {circle.description.length > 100 
              ? circle.description.slice(0, 100) + '…' 
              : circle.description}
          </p>
        )}

        {/* ─── Statut ─── */}
        <div className="card-status-row">
          <span className={`status-badge ${isFull ? 'full' : count <= 2 ? 'new' : 'open'}`}>
            {isFull ? 'Full' : count <= 2 ? 'New' : 'Open'}
          </span>
          <span className="card-spots">
            {isFull ? 'No spots left' : `${capacity - count} spots left`}
          </span>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="card-footer">
        <div className="card-creator">
          <span className="creator-avatar">{creatorInitial}</span>
          <span className="creator-name">by {creatorName}</span>
        </div>
        <Link 
          href={`/circles/${circle.id}`} 
          className={`btn-join ${isFull ? 'full' : ''}`}
        >
          {isFull ? 'Full' : 'Join'}
        </Link>
      </div>
    </article>
  )
}