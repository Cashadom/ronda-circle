'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CircleCard from './CircleCard'
import { listOpenCircles } from '@/lib/circleService'
import './CircleGrid.css'

const FALLBACK_CIRCLES = [
  { id: 'demo-1', title: 'Nom du groupe', type: 'dating', city: '', members_count: 8, capacity: 9, created_by: 'Anonymous' },
  { id: 'demo-2', title: 'Nom du groupe', type: 'dating', city: '', members_count: 6, capacity: 12, created_by: 'Anonymous' },
  { id: 'demo-3', title: 'Nom du groupe', type: 'business', city: '', members_count: 8, capacity: 9, created_by: 'Anonymous' },
  { id: 'demo-4', title: 'Nom du groupe', type: 'dating', city: '', members_count: 8, capacity: 9, created_by: 'Anonymous' },
  { id: 'demo-5', title: 'Nom du groupe', type: 'dating', city: '', members_count: 8, capacity: 9, created_by: 'Anonymous' },
]

export default function CircleGrid() {
  const [circles, setCircles] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    listOpenCircles()
      .then((data) => setCircles(Array.isArray(data) ? data : []))
      .catch(() => setCircles([]))
      .finally(() => setLoaded(true))
  }, [])

  const shown = loaded && circles.length ? circles : FALLBACK_CIRCLES

  return (
    <section className="circle-grid-section">
      <div className="circle-grid">
        {shown.map((circle) => (
          <CircleCard key={circle.id} circle={circle} />
        ))}
      </div>

      <div className="circle-grid-actions">
        <Link href="/create-circle" className="btn-primary">
          Create your circle now
        </Link>
        <Link href="/circles" className="link-see-all">
          &gt;&gt; See all circles
        </Link>
      </div>
    </section>
  )
}