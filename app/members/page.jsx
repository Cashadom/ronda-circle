'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Heart, MapPin, Star } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

const CORAL = '#FF7F50'
const CORAL_PALE = '#FFF0EB'

function pickColor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h << 5) - h + seed.charCodeAt(i)
  return Math.abs(h) % 2 === 0 ? CORAL : CORAL_PALE
}

function getInitials(name) {
  if (!name || name === 'Anonymous') return '?'
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
  return clean.slice(0, 2)
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(30)

  useEffect(() => {
    async function fetchMembers() {
       {
        const usersSnapshot = await getDocs(collection(db, 'users'))
        const users = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          name: doc.data().name || doc.data().displayName || doc.data().username || 'Ronda member',
          photoUrl: doc.data().photo_url || doc.data().photoURL || '',
          trustScore: doc.data().trust_score || 0,
          city: doc.data().city || '',
          circlesJoined: doc.data().circles_joined || 0,
          circlesCreated: doc.data().circles_created || 0,
          messagesCount: doc.data().messages_count || 0,
        }))
        // Trier par trustScore décroissant
        const sortedMembers = users.sort((a, b) => b.trustScore - a.trustScore)
        setMembers(sortedMembers)
      } catch (err) {
        console.error('Error loading members:', err)
        setError('Create a free account to view the members of this Circle.')
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const loadMore = () => setVisibleCount(prev => prev + 30)
  const visibleMembers = members.slice(0, visibleCount)
  const hasMore = visibleCount < members.length
  const totalMembers = members.length

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#FFF8F2', padding: 'clamp(24px, 5vw, 40px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header avec bouton Back */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                color: '#706965',
                fontSize: '0.85rem',
                fontWeight: 450,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 40,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0ede9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>

          {/* Titre + sous-titre */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 40,
              background: CORAL_PALE,
              color: CORAL,
              fontSize: '0.7rem',
              fontWeight: 500,
              marginBottom: 16,
            }}>
              Join the community
            </div>
            <h1 style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 500,
              color: '#2B2725',
              marginBottom: 12,
              letterSpacing: '-0.3px',
            }}>
              Meet the Ronda community
            </h1>
            <p style={{ color: '#706965', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>
              {totalMembers > 0 
                ? `${totalMembers} people already making real connections. Ready to join them?`
                : 'People who turn real-life meetings into lasting friendships.'}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#fff0ed', color: CORAL, padding: '12px 20px', borderRadius: 40, textAlign: 'center', marginBottom: 32
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 20,
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ textAlign: 'center', animation: 'pulse 1.5s infinite' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e8e5e1', margin: '0 auto 12px' }} />
                  <div style={{ width: '60%', height: 12, background: '#e8e5e1', margin: '0 auto 6px', borderRadius: 20 }} />
                  <div style={{ width: '40%', height: 10, background: '#e8e5e1', margin: '0 auto', borderRadius: 20 }} />
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 32, border: '1px solid #f0ede9' }}>
              <Users size={48} style={{ margin: '0 auto 16px', color: CORAL }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: 8 }}>The community is growing</h3>
              <p style={{ color: '#706965' }}>Be among the first to join Ronda.</p>
              <Link
                href="/create-circle"   // ← mis à jour vers /create-circle
                style={{
                  display: 'inline-block',
                  marginTop: 24,
                  background: 'transparent',
                  color: CORAL,
                  border: '1px solid #E9DDD4',
                  padding: '10px 28px',
                  borderRadius: 40,
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = CORAL_PALE; e.currentTarget.style.borderColor = CORAL }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E9DDD4' }}
              >
                Create a circle →
              </Link>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 24,
              }}>
                {visibleMembers.map((member) => {
                  const bgColor = pickColor(member.uid)
                  const initials = getInitials(member.name)
                  return (
                    <div
                      key={member.uid}
                      style={{
                        background: '#fff',
                        borderRadius: 28,
                        padding: '24px 16px 20px',
                        textAlign: 'center',
                        border: '1px solid #E9DDD4',
                        transition: 'all 0.25s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 20px 32px -12px rgba(0,0,0,0.08)'
                        e.currentTarget.style.borderColor = CORAL_PALE
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = '#E9DDD4'
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${bgColor === CORAL ? CORAL : CORAL_PALE}, ${bgColor === CORAL ? '#FF9F7A' : '#FFE0D5'})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 14px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 500, color: bgColor === CORAL ? '#fff' : CORAL }}>
                          {initials}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        color: '#2B2725',
                        marginBottom: 4,
                      }}>
                        {member.name}
                      </h3>

                      {member.city && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                          <MapPin size={10} style={{ color: '#706965' }} />
                          <span style={{ fontSize: '0.7rem', color: '#706965' }}>{member.city.split(',')[0]}</span>
                        </div>
                      )}

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: CORAL_PALE,
                        padding: '3px 10px',
                        borderRadius: 40,
                      }}>
                        <Star size={10} style={{ color: CORAL, fill: CORAL }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 500, color: CORAL }}>
                          {member.trustScore} pts
                        </span>
                      </div>

                      {member.circlesJoined > 0 && (
                        <div style={{ marginTop: 10, fontSize: '0.6rem', color: '#706965' }}>
                          {member.circlesJoined} circle{member.circlesJoined !== 1 ? 's' : ''} joined
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                  <button
                    onClick={loadMore}
                    style={{
                      background: 'transparent',
                      border: '1px solid #E9DDD4',
                      padding: '10px 28px',
                      borderRadius: 40,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#706965',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = CORAL
                      e.currentTarget.style.color = CORAL
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#E9DDD4'
                      e.currentTarget.style.color = '#706965'
                    }}
                  >
                    Show more members
                  </button>
                </div>
              )}

              {/* CTA pour les non-membres */}
              <div style={{
                marginTop: 64,
                textAlign: 'center',
                padding: '40px 24px',
                background: '#fff',
                borderRadius: 32,
                border: '1px solid #E9DDD4',
              }}>
                <Heart size={28} style={{ margin: '0 auto 12px', color: CORAL }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 8 }}>Ready to expand your circle?</h3>
                <p style={{ color: '#706965', fontSize: '0.85rem', marginBottom: 20 }}>
                  Create one or join an existing public circle.
                </p>
                <Link
                  href="/circles"
                  style={{
                    display: 'inline-block',
                    background: CORAL,
                    color: '#fff',
                    border: 'none',
                    padding: '10px 28px',
                    borderRadius: 40,
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F45542'}
                  onMouseLeave={e => e.currentTarget.style.background = CORAL}
                >
                  Browse circles →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
