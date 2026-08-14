'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

const CORAL = '#FF6B5A'

export default function ConnectionsPage() {
  const router = useRouter()

  const [user, setUser] = useState(undefined)

  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [connected, setConnected] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push('/login')
        return
      }

      setUser(u)

      await loadConnections(u.uid)
    })

    return () => unsub()
  }, [router])

  async function loadConnections(currentUid) {
    setLoading(true)
    setError('')

    try {
      const connectionsQuery = query(
        collection(db, 'connections'),
        where('participants', 'array-contains', currentUid)
      )

      const snapshot = await getDocs(connectionsQuery)

      const rawConnections = snapshot.docs.map((connectionDoc) => ({
        id: connectionDoc.id,
        ...connectionDoc.data(),
      }))

      const enrichedConnections = await Promise.all(
        rawConnections.map(async (connection) => {
          const participants = Array.isArray(connection.participants)
            ? connection.participants
            : []

          const otherUid =
            participants.find((uid) => uid !== currentUid) || ''

          let otherUser = {
            uid: otherUid,
            name: 'Ronda member',
            city: '',
            gender: '',
            photoURL: '/point.png',
            intentions: [],
            introduction: '',
          }

          if (otherUid) {
            try {
              const userSnapshot = await getDoc(
                doc(db, 'users', otherUid)
              )

              if (userSnapshot.exists()) {
                const data = userSnapshot.data()

                otherUser = {
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

                  intentions:
                    Array.isArray(data.intentions)
                      ? data.intentions
                      : [],

                  introduction:
                    data.introduction ||
                    data.bio ||
                    '',
                }
              }
            } catch (profileError) {
              console.error(
                'Error loading connection profile:',
                profileError
              )
            }
          }

          return {
            ...connection,
            otherUid,
            otherUser,
          }
        })
      )

      const receivedRequests = enrichedConnections.filter(
        (connection) =>
          connection.status === 'pending' &&
          connection.requestedBy !== currentUid
      )

      const sentRequests = enrichedConnections.filter(
        (connection) =>
          connection.status === 'pending' &&
          connection.requestedBy === currentUid
      )

      const activeConnections = enrichedConnections.filter(
        (connection) =>
          connection.status === 'connected'
      )

      setReceived(receivedRequests)
      setSent(sentRequests)
      setConnected(activeConnections)
    } catch (err) {
      console.error('Error loading connections:', err)

      setError(
        'Could not load your connections. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAccept(connectionId) {
    if (!user || processingId) return

    setProcessingId(connectionId)

    try {
      await updateDoc(
        doc(db, 'connections', connectionId),
        {
          status: 'connected',
          connected_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        }
      )

      await loadConnections(user.uid)
    } catch (err) {
      console.error('Error accepting connection:', err)

      window.alert(
        'The connection could not be accepted.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  async function handleIgnore(connectionId) {
    if (!user || processingId) return

    const confirmed = window.confirm(
      'Ignore this connection request?'
    )

    if (!confirmed) return

    setProcessingId(connectionId)

    try {
      await deleteDoc(
        doc(db, 'connections', connectionId)
      )

      await loadConnections(user.uid)
    } catch (err) {
      console.error('Error ignoring connection:', err)

      window.alert(
        'The request could not be removed.'
      )
    } finally {
      setProcessingId(null)
    }
  }

  function genderColor(gender) {
    if (gender === 'female') return '#E93C87'
    if (gender === 'male') return '#3478C5'

    return '#343434'
  }

  function PersonRow({
    connection,
    mode,
    index,
  }) {
    const person = connection.otherUser

    return (
      <div
        style={{
          width: '100%',
          boxSizing: 'border-box',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          gap: 18,

          padding: '12px 14px',

          background:
            index % 2 === 0
              ? '#F4F9FC'
              : '#FAFCFD',

          border:
            '1px solid rgba(43,39,37,0.04)',

          borderRadius: 10,
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
            src={person.photoURL || '/point.png'}
            alt={person.name}
            onError={(event) => {
              event.currentTarget.src =
                '/point.png'
            }}
            style={{
              width: 44,
              height: 44,

              flex: '0 0 44px',

              borderRadius: '50%',

              objectFit: 'cover',
              objectPosition: 'center',

              background: '#FFFFFF',

              border: '2px solid #FFFFFF',

              boxShadow:
                '0 2px 8px rgba(43,39,37,0.07)',
            }}
          />

          <div
            style={{
              minWidth: 0,

              fontFamily:
                '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 5,

                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,

                  color: genderColor(
                    person.gender
                  ),

                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {person.name}
              </span>

              {person.gender && (
                <span
                  style={{
                    color: '#817A75',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {person.gender === 'female'
                    ? '♀'
                    : person.gender === 'male'
                      ? '♂'
                      : ''}
                </span>
              )}
            </div>

            {person.city && (
              <div
                style={{
                  marginTop: 2,

                  color: '#817A75',

                  fontSize: '0.75rem',
                }}
              >
                {person.city}
              </div>
            )}

            {person.intentions.length > 0 && (
              <div
                style={{
                  marginTop: 3,

                  color: '#FF604E',

                  fontSize: '0.72rem',
                  fontWeight: 500,

                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {person.intentions
                  .slice(0, 5)
                  .join(' · ')}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,

            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {mode === 'received' && (
            <>
              <button
                type="button"
                disabled={
                  processingId === connection.id
                }
                onClick={() =>
                  handleIgnore(connection.id)
                }
                style={{
                  border:
                    '1px solid #E9DDD4',

                  background: '#FFFFFF',

                  color: '#706965',

                  padding: '7px 14px',

                  borderRadius: 999,

                  fontFamily:
                    '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                  fontSize: '0.75rem',
                  fontWeight: 600,

                  cursor:
                    processingId === connection.id
                      ? 'default'
                      : 'pointer',
                }}
              >
                Ignore
              </button>

              <button
                type="button"
                disabled={
                  processingId === connection.id
                }
                onClick={() =>
                  handleAccept(connection.id)
                }
                style={{
                  border: 'none',

                  background: CORAL,

                  color: '#FFFFFF',

                  padding: '7px 16px',

                  borderRadius: 999,

                  fontFamily:
                    '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                  fontSize: '0.75rem',
                  fontWeight: 650,

                  cursor:
                    processingId === connection.id
                      ? 'default'
                      : 'pointer',
                }}
              >
                {processingId === connection.id
                  ? '...'
                  : 'Accept'}
              </button>
            </>
          )}

          {mode === 'sent' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',

                minWidth: 82,

                padding: '7px 15px',

                borderRadius: 999,

                background: '#F3EEEA',

                color: '#817A75',

                fontSize: '0.74rem',
                fontWeight: 600,
              }}
            >
              Pending
            </span>
          )}

          {mode === 'connected' && (
            <Link
              href={`/messages/${connection.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',

                minWidth: 82,

                padding: '7px 16px',

                borderRadius: 999,

                background: CORAL,

                color: '#FFFFFF',

                textDecoration: 'none',

                fontFamily:
                  '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                fontSize: '0.75rem',
                fontWeight: 650,
              }}
            >
              Message
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: '100vh',
          background: '#FFF8F2',

          padding:
            '125px 20px 70px',

          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              marginBottom: 38,
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
              Connections
            </h1>

            <p
              style={{
                margin: 0,

                color: '#706965',

                fontSize: '0.92rem',

                lineHeight: 1.5,
              }}
            >
              Connect with people you want to know.
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
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: 68,

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
          ) : (
            <>
              {/* RECEIVED */}

              <section
                style={{
                  marginBottom: 38,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent:
                      'space-between',

                    gap: 15,

                    marginBottom: 13,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,

                      fontFamily:
                        '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                      fontSize: '1.1rem',
                      fontWeight: 700,

                      color: '#2B2725',
                    }}
                  >
                    Requests
                  </h2>

                  <span
                    style={{
                      color: '#A39C97',
                      fontSize: '0.75rem',
                    }}
                  >
                    {received.length}
                  </span>
                </div>

                {received.length === 0 ? (
                  <div
                    style={{
                      padding: '18px',

                      borderRadius: 10,

                      background: '#FAFCFD',

                      color: '#817A75',

                      fontSize: '0.82rem',
                    }}
                  >
                    No new connection requests.
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr',
                      gap: 8,
                    }}
                  >
                    {received.map(
                      (connection, index) => (
                        <PersonRow
                          key={connection.id}
                          connection={connection}
                          mode="received"
                          index={index}
                        />
                      )
                    )}
                  </div>
                )}
              </section>


              {/* CONNECTED */}

              <section
                style={{
                  marginBottom: 38,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent:
                      'space-between',

                    gap: 15,

                    marginBottom: 13,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,

                      fontFamily:
                        '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                      fontSize: '1.1rem',
                      fontWeight: 700,

                      color: '#2B2725',
                    }}
                  >
                    Your connections
                  </h2>

                  <span
                    style={{
                      color: CORAL,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {connected.length} / 20
                  </span>
                </div>

                {connected.length === 0 ? (
                  <div
                    style={{
                      padding: '20px',

                      borderRadius: 10,

                      background: '#FAFCFD',

                      color: '#817A75',

                      fontSize: '0.82rem',
                    }}
                  >
                    You don't have any connections yet.{' '}

                    <Link
                      href="/members"
                      style={{
                        color: CORAL,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Discover people →
                    </Link>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr',
                      gap: 8,
                    }}
                  >
                    {connected.map(
                      (connection, index) => (
                        <PersonRow
                          key={connection.id}
                          connection={connection}
                          mode="connected"
                          index={index}
                        />
                      )
                    )}
                  </div>
                )}
              </section>


              {/* SENT */}

              {sent.length > 0 && (
                <section>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent:
                        'space-between',

                      gap: 15,

                      marginBottom: 13,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,

                        fontFamily:
                          '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                        fontSize: '1.1rem',
                        fontWeight: 700,

                        color: '#2B2725',
                      }}
                    >
                      Sent requests
                    </h2>

                    <span
                      style={{
                        color: '#A39C97',
                        fontSize: '0.75rem',
                      }}
                    >
                      {sent.length}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr',
                      gap: 8,
                    }}
                  >
                    {sent.map(
                      (connection, index) => (
                        <PersonRow
                          key={connection.id}
                          connection={connection}
                          mode="sent"
                          index={index}
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </>
          )}
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