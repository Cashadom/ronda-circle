'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'
import { onAuthChange, signOut } from '@/lib/auth'
import { getUserProfile, updateUserProfile } from '@/lib/users'
import { getTrustLevel } from '@/lib/trust'
import { getUserCircles } from '@/lib/circleService'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [myCircles, setMyCircles] = useState([])
  const [circlesLoading, setCirclesLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onAuthChange(async u => {
      if (!u) {
        router.push('/login')
        return
      }
      setUser(u)
      const p = await getUserProfile(u.uid)
      setProfile(p)
      setName(p?.name || '')
      setCity(p?.city || '')

      // Charger les cercles de l'utilisateur
      setCirclesLoading(true)
      try {
        const circles = await getUserCircles(u.uid)
        setMyCircles(circles)
      } catch (err) {
        console.error('Error loading user circles:', err)
        setMyCircles([])
      } finally {
        setCirclesLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  async function handleSave() {
    setSaving(true)
    await updateUserProfile(user.uid, { name, city: city.toLowerCase() })
    setProfile(p => ({ ...p, name, city: city.toLowerCase() }))
    setEditing(false)
    setSaving(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div style={{ paddingTop: '120px', textAlign: 'center' }}>
          <div style={{
            width: 32,
            height: 32,
            border: '3px solid #FF6B5A',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            margin: '0 auto'
          }} />
        </div>
        <Footer />
      </>
    )
  }

  const level = getTrustLevel(profile.trust_score || 0)
  const score = profile.trust_score || 0

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FFF8F2' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px' }}>

          {/* Avatar + Nom */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '36px'
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#FF6B5A',
              backgroundImage: user?.photoURL ? `url(${user.photoURL})` : 'none',
              backgroundSize: 'cover',
              border: '3px solid #f0e4d8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#fff'
            }}>
              {!user?.photoURL && profile.name?.[0]}
            </div>
            <div>
              <h1 style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#2B2725',
                marginBottom: '6px'
              }}>
                {profile.name}
              </h1>
              <span style={{
                display: 'inline-block',
                background: '#FFF0EB',
                color: '#FF6B5A',
                border: '1px solid #FFD7CF',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                ★ Trust {score}
              </span>
            </div>
          </div>

          {/* Trust Score + Statistiques */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E9DDD4',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            textAlign: 'center'
          }}>
            {[
              { label: 'Trust Score', value: score },
              { label: 'Circles Joined', value: profile.circles_joined || 0 },
              { label: 'Circles Created', value: profile.circles_created || 0 }
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#FF6B5A',
                  lineHeight: 1
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: '#706965',
                  marginTop: '4px',
                  fontWeight: 500
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Niveau de confiance */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E9DDD4',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.875rem', color: '#706965' }}>
              Trust level
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: level.color
            }}>
              ★ {level.label}
            </span>
          </div>

          {/* Édition du profil */}
          {editing ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E9DDD4',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <p style={{ fontWeight: 600, color: '#2B2725', marginBottom: '16px' }}>
                Edit profile
              </p>
              {[
                { label: 'Display name', value: name, set: setName, placeholder: 'Your name' },
                { label: 'City', value: city, set: setCity, placeholder: 'e.g. Chennai' }
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#706965',
                    marginBottom: '6px'
                  }}>
                    {f.label}
                  </label>
                  <input
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #E9DDD4',
                      fontSize: '0.9rem',
                      color: '#2B2725',
                      background: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button onClick={handleSave} loading={saving} size="sm">Save</Button>
                <Button variant="secondary" onClick={() => setEditing(false)} size="sm">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
              style={{ marginBottom: '24px', width: '100%' }}
            >
              Edit profile
            </Button>
          )}

          {/* Mes Circles — VRAIS CERCLES */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E9DDD4',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h2 style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#2B2725',
              marginBottom: '8px'
            }}>
              My circles
            </h2>

            {circlesLoading ? (
              <p style={{ color: '#706965', fontSize: '0.9rem' }}>
                Loading your circles...
              </p>
            ) : myCircles.length === 0 ? (
              <>
                <p style={{ color: '#706965', fontSize: '0.9rem' }}>
                  You haven't joined any circle yet.
                </p>
                <Link
                  href="/circles"
                  style={{
                    display: 'inline-block',
                    marginTop: '16px',
                    color: '#FF6B5A',
                    textDecoration: 'none',
                    borderBottom: '1px solid #FF6B5A',
                    paddingBottom: '2px'
                  }}
                >
                  Browse circles →
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myCircles.map((circle) => (
                  <Link
                    key={circle.id}
                    href={`/circles/${circle.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#fcf9f7',
                      borderRadius: '12px',
                      border: '1px solid #ede8e2',
                      textDecoration: 'none',
                      color: '#1c1917',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF6B5A'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ede8e2'}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {circle.title || 'Untitled circle'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#706965' }}>
                        {circle.city || 'Remote'} · {circle.type || 'Circle'}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      background: '#FF6B5A',
                      color: '#fff',
                      padding: '3px 12px',
                      borderRadius: '999px',
                      fontWeight: 500
                    }}>
                      {circle.role === 'owner' ? 'Owner' : 'Member'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Voir tous les membres */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <Link
              href="/members"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#FF6B5A',
                fontSize: '0.85rem',
                fontWeight: 500,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '40px',
                border: '1px solid #E9DDD4',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFF0EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              👥 See all members →
            </Link>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleSignOut}
              style={{
                padding: '13px',
                borderRadius: '12px',
                border: '1px solid #E9DDD4',
                background: 'none',
                fontSize: '0.9rem',
                color: '#706965',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f4f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}