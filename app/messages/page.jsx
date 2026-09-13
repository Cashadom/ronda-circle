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
        className="messages-page"
        style={{
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          background: '#FFFFFF',
          padding: '125px 20px 70px',
          boxSizing: 'border-box',
          overflowX: 'hidden',
        }}
      >
        <div
          className="messages-container"
          style={{
            width: '100%',
            maxWidth: 850,
            minWidth: 0,
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '100%',
              minWidth: 0,
              marginBottom: 30,
            }}
          >
            <h1
              style={{
                fontFamily:
                  '"Manrope", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

                fontSize:
                  'clamp(2rem, 5vw, 2.7rem)',

                fontWeight: 750,

                color: '#25211F',

                lineHeight: 1.08,

                letterSpacing: '-0.035em',

                margin: '0 0 8px',
              }}
            >
              Messages
            </h1>

            <p
              style={{
                margin: 0,
                color: '#746F6B',
                fontFamily:
                  '"Manrope", system-ui, sans-serif',
                fontSize: '0.9rem',
                lineHeight: 1.5,
              }}
            >
              Conversations with your Ronda connections.
            </p>
          </div>

          {error && (
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                marginBottom: 24,
                border:
                  '1px solid #FFD7D0',
                borderRadius: 12,
                background: '#FFF5F2',
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
                gridTemplateColumns: 'minmax(0, 1fr)',
                width: '100%',
                minWidth: 0,
                gap: 8,
              }}
            >
              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '100%',
                    height: 72,
                    boxSizing: 'border-box',
                    borderRadius: 14,

                    background:
                      index % 2 === 0
                        ? '#FFFFFF'
                        : '#FFF9F7',

                    border:
                      index % 2 === 0
                        ? '1px solid #EBE4DF'
                        : '1px solid #F2EAE6',

                    animation:
                      'pulse 1.4s infinite',
                  }}
                />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                width: '100%',
                boxSizing: 'border-box',

                padding: '34px 22px',

                background: '#FFFFFF',

                border:
                  '1px solid #EBE4DF',

                borderRadius: 18,

                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  margin: '0 0 8px',

                  fontFamily:
                    '"Manrope", system-ui, sans-serif',

                  fontSize: '1.05rem',

                  fontWeight: 700,

                  color: '#25211F',
                }}
              >
                No conversations yet
              </h2>

              <p
                style={{
                  maxWidth: 520,

                  margin:
                    '0 auto 18px',

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

                  minHeight: 38,

                  padding: '0 18px',

                  boxSizing: 'border-box',

                  background: CORAL,

                  color: '#FFFFFF',

                  borderRadius: 999,

                  textDecoration: 'none',

                  fontFamily:
                    '"Manrope", system-ui, sans-serif',

                  fontSize: '0.78rem',

                  fontWeight: 700,
                }}
              >
                Discover people
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',

                gridTemplateColumns:
                  'minmax(0, 1fr)',

                width: '100%',

                minWidth: 0,

                gap: 8,
              }}
            >
              {conversations.map(
                (conversation, index) => {
                  const person =
                    conversation.person

                  return (
                    <Link
                      key={conversation.id}

                      href={`/messages/${conversation.id}`}

                      className="conversation-row"

                      style={{
                        display: 'flex',

                        alignItems: 'center',

                        justifyContent:
                          'space-between',

                        width: '100%',

                        maxWidth: '100%',

                        minWidth: 0,

                        gap: 12,

                        padding: '12px 14px',

                        boxSizing: 'border-box',

                        background:
                          index % 2 === 0
                            ? '#FFFFFF'
                            : '#FFF9F7',

                        border:
                          index % 2 === 0
                            ? '1px solid #EBE4DF'
                            : '1px solid #F2EAE6',

                        borderRadius: 16,

                        textDecoration: 'none',

                        overflow: 'hidden',

                        transition:
                          'transform .18s ease, box-shadow .18s ease',
                      }}
                    >
                      <div
                        className="conversation-person"
                        style={{
                          display: 'flex',

                          alignItems: 'center',

                          flex:
                            '1 1 0%',

                          minWidth: 0,

                          gap: 12,

                          overflow:
                            'hidden',
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

                          onError={(event) => {
                            event.currentTarget.src =
                              '/point.png'
                          }}

                          className="conversation-avatar"

                          style={{
                            width: 48,

                            height: 48,

                            flex:
                              '0 0 48px',

                            boxSizing:
                              'border-box',

                            borderRadius: 14,

                            objectFit:
                              'cover',

                            objectPosition:
                              'center',

                            background:
                              '#F8F5F3',

                            border:
                              '2px solid #FFFFFF',

                            boxShadow:
                              '0 2px 8px rgba(43,39,37,0.07)',
                          }}
                        />

                        <div
                          style={{
                            flex:
                              '1 1 0%',

                            minWidth: 0,

                            overflow:
                              'hidden',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',

                              alignItems:
                                'baseline',

                              width: '100%',

                              minWidth: 0,

                              gap: 5,

                              marginBottom: 3,

                              overflow:
                                'hidden',
                            }}
                          >
                            <span
                              style={{
                                minWidth: 0,

                                overflow:
                                  'hidden',

                                textOverflow:
                                  'ellipsis',

                                whiteSpace:
                                  'nowrap',

                                fontFamily:
                                  '"Manrope", system-ui, sans-serif',

                                fontSize:
                                  '0.9rem',

                                fontWeight: 700,

                                lineHeight: 1.35,

                                color:
                                  genderColor(
                                    person.gender
                                  ),
                              }}
                            >
                              {person.name}
                            </span>

                            {person.city && (
                              <span
                                className="conversation-city"

                                style={{
                                  minWidth: 0,

                                  overflow:
                                    'hidden',

                                  textOverflow:
                                    'ellipsis',

                                  whiteSpace:
                                    'nowrap',

                                  color:
                                    '#9A9591',

                                  fontSize:
                                    '0.7rem',

                                  fontWeight: 500,
                                }}
                              >
                                · {person.city}
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              width: '100%',

                              minWidth: 0,

                              color:
                                conversation.lastMessage
                                  ? '#746F6B'
                                  : '#A19B97',

                              fontSize:
                                '0.77rem',

                              lineHeight: 1.45,

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
                        className="conversation-date"

                        style={{
                          flex:
                            '0 0 auto',

                          maxWidth: 78,

                          overflow:
                            'hidden',

                          textOverflow:
                            'ellipsis',

                          whiteSpace:
                            'nowrap',

                          color:
                            '#9A9591',

                          fontSize:
                            '0.68rem',

                          fontWeight: 500,

                          textAlign:
                            'right',
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
              width: '100%',

              marginTop: 28,

              textAlign:
                'center',
            }}
          >
            <Link
              href="/connections"

              style={{
                color: CORAL,

                fontFamily:
                  '"Manrope", system-ui, sans-serif',

                fontSize:
                  '0.8rem',

                fontWeight: 600,

                textDecoration:
                  'none',
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


        @media (max-width: 820px) {

          .messages-page {
            padding:
              120px 16px 56px !important;
          }

        }


        @media (max-width: 640px) {

          .messages-page {
            padding:
              112px 12px 44px !important;
          }


          .messages-container {
            width: 100% !important;

            max-width: 100% !important;

            min-width: 0 !important;
          }


          .conversation-person {
            gap: 10px !important;
          }


          .conversation-avatar {
            width: 44px !important;

            height: 44px !important;

            flex-basis: 44px !important;

            border-radius: 12px !important;
          }


          .conversation-date {
            max-width: 62px !important;

            font-size: 0.62rem !important;
          }

        }


        @media (max-width: 420px) {

          .messages-page {
            padding-left:
              10px !important;

            padding-right:
              10px !important;
          }


          .conversation-city {
            display:
              none !important;
          }


          .conversation-avatar {
            width: 40px !important;

            height: 40px !important;

            flex-basis:
              40px !important;
          }


          .conversation-date {
            max-width:
              52px !important;

            font-size:
              0.59rem !important;
          }

        }

      `}</style>
    </>
  )
}
