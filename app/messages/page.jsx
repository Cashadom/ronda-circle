'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

const CORAL = '#FF6B5A'

export default function MessagesPage() {
  const router = useRouter()

  const [user, setUser] = useState(undefined)
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push('/login')
        return
      }

      setUser(u)

      await loadConversations(u.uid)
    })

    return () => unsub()
  }, [router])

  async function loadConversations(currentUid) {
    setLoading(true)
    setError('')

    try {
      const connectionsQuery = query(
        collection(db, 'connections'),
        where('participants', 'array-contains', currentUid),
        where('status', '==', 'connected')
      )

      const snapshot = await getDocs(connectionsQuery)

      const connections = snapshot.docs.map((connectionDoc) => ({
        id: connectionDoc.id,
        ...connectionDoc.data(),
      }))

      const enriched = await Promise.all(
        connections.map(async (connection) => {
          const participants = Array.isArray(connection.participants)
            ? connection.participants
            : []

          const otherUid =
            participants.find((uid) => uid !== currentUid) || ''

          let person = {
            uid: otherUid,
            name: 'Ronda member',
            city: '',
            gender: '',
            photoURL: '/point.png',
          }

          if (otherUid) {
            try {
              const userSnapshot = await getDoc(
                doc(db, 'users', otherUid)
              )

              if (userSnapshot.exists()) {
                const data = userSnapshot.data()

                person = {
                  uid: otherUid,

                  name:
                    data.name ||
                    data.displayName ||
                    data.username ||
                    'Ronda member',

                  city:
                    String(data.city || '').toUpperCase(),

                  gender:
                    data.gender || '',

                  photoURL:
                    data.photoURL ||
                    data.photo_url ||
                    '/point.png',
                }
              }
            } catch (profileError) {
              console.error(
                'Error loading conversation profile:',
                profileError
              )
            }
          }

          return {
            id: connection.id,
            person,

            lastMessage:
              connection.lastMessage ||
              '',

            lastMessageAt:
              connection.lastMessageAt ||
              connection.updated_at ||
              connection.connected_at ||
              null,
          }
        })
      )

      setConversations(enriched)
    } catch (err) {
      console.error(
        'Error loading conversations:',
        err
      )

      setError(
        'Could not load your messages. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  function genderColor(gender) {
    if (gender === 'female') return '#E93C87'
    if (gender === 'male') return '#3478C5'

    return '#343434'
  }

  function formatDate(value) {
    if (!value) return ''

    try {
      const date =
        typeof value.toDate === 'function'
          ? value.toDate()
          : new Date(value)

      if (Number.isNaN(date.getTime())) {
        return ''
      }

      const today = new Date()

      const sameDay =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()

      if (sameDay) {
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      }

      return date.toLocaleDateString([], {
        day: '2-digit',
        month: 'short',
      })
    } catch {
      return ''
    }
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: '100vh',
          background: '#FFF8F2',
          padding: '125px 20px 70px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 850,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              marginBottom: 34,
            }}
          >
            <h1
              style={{
                fontFamily:
                  '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                fontSize:
                  'clamp(2rem, 5vw, 2.7rem)',

                fontWeight: 700,

                color: '#2B2725',

                letterSpacing: '-0.03em',

                margin: '0 0 8px',
              }}
            >
              Messages
            </h1>

            <p
              style={{
                margin: 0,
                color: '#706965',
                fontSize: '0.92rem',
                lineHeight: 1.5,
              }}
            >
              Conversations with your Ronda connections.
            </p>
          </div>

          {error && (
            <div
              style={{
                padding: '12px 16px',
                marginBottom: 24,
                borderRadius: 12,
                background: '#FFF0EB',
                color: CORAL,
                fontSize: '0.82rem',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: 72,
                    borderRadius: 10,
                    background:
                      index % 2 === 0
                        ? '#F4F9FC'
                        : '#FAFCFD',
                    animation:
                      'pulse 1.4s infinite',
                  }}
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                padding: '34px 22px',
                background: '#FFFFFF',
                border:
                  '1px solid #E9DDD4',
                borderRadius: 18,
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  margin: '0 0 8px',
                  fontFamily:
                    '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#2B2725',
                }}
              >
                No conversations yet
              </h2>

              <p
                style={{
                  margin: '0 0 18px',
                  color: '#817A75',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                }}
              >
                Connect with people first. Once they accept, you can message each other.
              </p>

              <Link
                href="/members"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  padding: '9px 18px',

                  background: CORAL,
                  color: '#FFFFFF',

                  borderRadius: 999,

                  textDecoration: 'none',

                  fontSize: '0.8rem',
                  fontWeight: 650,
                }}
              >
                Discover people
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
              }}
            >
              {conversations.map(
                (conversation, index) => {
                  const person = conversation.person

                  return (
                    <Link
                      key={conversation.id}
                      href={`/messages/${conversation.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',

                        gap: 16,

                        padding: '12px 14px',

                        background:
                          index % 2 === 0
                            ? '#F4F9FC'
                            : '#FAFCFD',

                        border:
                          '1px solid rgba(43,39,37,0.04)',

                        borderRadius: 10,

                        textDecoration: 'none',

                        transition:
                          'transform .18s ease, box-shadow .18s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <img
                          src={
                            person.photoURL ||
                            '/point.png'
                          }
                          alt={
                            person.name
                          }
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              '/point.png'
                          }}
                          style={{
                            width: 46,
                            height: 46,

                            flex:
                              '0 0 46px',

                            borderRadius:
                              '50%',

                            objectFit:
                              'cover',

                            objectPosition:
                              'center',

                            background:
                              '#FFFFFF',

                            border:
                              '2px solid #FFFFFF',

                            boxShadow:
                              '0 2px 8px rgba(43,39,37,0.07)',
                          }}
                        />

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems:
                                'baseline',
                              gap: 5,
                              marginBottom: 3,
                            }}
                          >
                            <span
                              style={{
                                fontFamily:
                                  '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                                fontSize:
                                  '0.92rem',

                                fontWeight: 700,

                                color:
                                  genderColor(
                                    person.gender
                                  ),

                                whiteSpace:
                                  'nowrap',

                                overflow:
                                  'hidden',

                                textOverflow:
                                  'ellipsis',
                              }}
                            >
                              {person.name}
                            </span>

                            {person.city && (
                              <span
                                style={{
                                  color:
                                    '#A39C97',

                                  fontSize:
                                    '0.72rem',

                                  whiteSpace:
                                    'nowrap',
                                }}
                              >
                                · {person.city}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              color:
                                conversation.lastMessage
                                  ? '#706965'
                                  : '#A39C97',

                              fontSize:
                                '0.78rem',

                              whiteSpace:
                                'nowrap',

                              overflow:
                                'hidden',

                              textOverflow:
                                'ellipsis',
                            }}
                          >
                            {conversation.lastMessage ||
                              'You are connected. Say hello.'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          flexShrink: 0,

                          color: '#A39C97',

                          fontSize: '0.7rem',
                        }}
                      >
                        {formatDate(
                          conversation.lastMessageAt
                        )}
                      </div>
                    </Link>
                  )
                }
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 28,
              textAlign: 'center',
            }}
          >
            <Link
              href="/connections"
              style={{
                color: CORAL,
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Manage connections →
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}