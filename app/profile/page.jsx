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
      <div style={{ paddingTop: '88px', minHeight: '100vh', background: '#FFF8F2' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px 20px 48px' }}>

          {/* Avatar + Nom + Trust */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '32px'
          }}>
            <div style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: '#FF6B5A',
              backgroundImage: user?.photoURL ? `url(${user.photoURL})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              flexShrink: 0,
              border: '3px solid #FFFFFF',
              boxShadow: '0 0 0 1px #E9DDD4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              fontWeight: 700,
              color: '#fff'
            }}>
              {!user?.photoURL && profile.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#2B2725',
                margin: '0 0 8px',
                lineHeight: 1.2
              }}>
                {profile.name}
              </h1>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#FFF0EB',
                color: '#FF6B5A',
                border: '1px solid #FFD7CF',
                borderRadius: 999,
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                Trust {score}
              </span>
            </div>
          </div>

          {/* Statistiques */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E9DDD4',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            textAlign: 'center'
          }}>
            {[
              { label: 'Trust score', value: score },
              { label: 'Circles joined', value: profile.circles_joined || 0 },
              { label: 'Circles created', value: profile.circles_created || 0 }
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontSize: '1.7rem',
                  fontWeight: 700,
                  color: '#FF6B5A',
                  lineHeight: 1
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#9A918B',
                  marginTop: '6px',
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
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', color: '#706965' }}>
              Trust level
            </span>
            <span style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: level.color
            }}>
              {level.label}
            </span>
          </div>

          {/* Édition du profil */}
          {editing ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E9DDD4',
              borderRadius: '16px',
              padding: '22px',
              marginBottom: '20px'
            }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#2B2725', margin: '0 0 16px' }}>
                Edit profile
              </p>
              {[
                { label: 'Display name', value: name, set: setName, placeholder: 'Your name' },
                { label: 'City', value: city, set: setCity, placeholder: 'e.g. Chennai' }
              ].map(f => (
                <div key={f.label} style={{ marginBottom: '14px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#9A918B',
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
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Button onClick={handleSave} loading={saving} size="sm">Save</Button>
                <Button variant="secondary" onClick={() => setEditing(false)} size="sm">Cancel</Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setEditing(true)}
              style={{ marginBottom: '20px', width: '100%' }}
            >
              Edit profile
            </Button>
          )}

          {/* Mes Circles */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E9DDD4',
            borderRadius: '16px',
            padding: '22px',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#2B2725',
              margin: '0 0 14px'
            }}>
              My circles
            </h2>

            {circlesLoading ? (
              <p style={{ color: '#9A918B', fontSize: '0.88rem', margin: 0 }}>
                Loading your circles…
              </p>
            ) : myCircles.length === 0 ? (
              <>
                <p style={{ color: '#706965', fontSize: '0.88rem', margin: 0 }}>
                  You haven't joined any circle yet.
                </p>
                <Link
                  href="/circles"
                  style={{
                    display: 'inline-block',
                    marginTop: '14px',
                    color: '#FF6B5A',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: '1px solid #FF6B5A',
                    paddingBottom: '2px'
                  }}
                >
                  Browse circles →
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myCircles.map((circle) => (
                  <Link
                    key={circle.id}
                    href={`/circles/${circle.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      background: '#FCF9F7',
                      borderRadius: '12px',
                      border: '1px solid #EDE8E2',
                      textDecoration: 'none',
                      color: '#2B2725',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FF6B5A'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#EDE8E2'}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        fontSize: '0.92rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {circle.title || 'Untitled circle'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9A918B', marginTop: '2px' }}>
                        {circle.city || 'Remote'} · {circle.type || 'Circle'}
                      </div>
                    </div>
                    <span style={{
                      flexShrink: 0,
                      fontSize: '0.7rem',
                      background: circle.role === 'owner' ? '#2B2725' : '#FF6B5A',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontWeight: 600
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
                gap: '6px',
                color: '#FF6B5A',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '9px 18px',
                borderRadius: 999,
                border: '1px solid #E9DDD4',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FFF0EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              See all members →
            </Link>
          </div>

          {/* Actions */}
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: '1px solid #E9DDD4',
              background: 'none',
              fontSize: '0.88rem',
              color: '#706965',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F8F4F0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            Sign out
          </button>

        </div>
      </div>
      <Footer />
    </>
  )
}