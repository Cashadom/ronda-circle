'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { CIRCLE_TYPES, CAPACITY_MIN, CAPACITY_MAX, DEFAULT_CAPACITY } from '@/lib/circles'
import { createCircle } from '@/lib/circleService'
import { getCurrentUser, signInWithGoogle } from '@/lib/auth'

export default function CreateCirclePage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', city: '', type: 'dating', description: '', capacity: DEFAULT_CAPACITY })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.title.trim()) return setError('Title is required')
    setLoading(true)
    try {
      let user = getCurrentUser()
      if (!user) user = await signInWithGoogle()
      const id = await createCircle(form, user)
      router.push(`/circles/${id}`)
    } catch (err) {
      setError(err.message || 'Unable to create circle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <Navbar />
      <section className="container form-page">
        <span className="kicker">Create a local or remote circle</span>
        <h1>Create a circle.</h1>
        <p>City is optional. Capacity is mandatory: minimum 6, maximum 12, default 12.</p>

        <form className="form panel" onSubmit={submit} style={{ padding: 24 }}>
          <div className="field">
            <label>Circle title</label>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Example: Aix new friends / Remote founders" />
          </div>
          <div className="field">
            <label>Theme</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)}>
              {CIRCLE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>City / location <span className="note">optional</span></label>
            <input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="City or leave empty for remote" />
          </div>
          <div className="field">
            <label>Maximum members</label>
            <input type="number" min={CAPACITY_MIN} max={CAPACITY_MAX} value={form.capacity} onChange={(e) => update('capacity', e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What is this circle for?" />
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" disabled={loading}>{loading ? 'Creating...' : 'Create circle'}</button>
        </form>
      </section>
    </main>
  )
}
