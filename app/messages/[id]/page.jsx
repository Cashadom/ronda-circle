'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

const CORAL = '#FF6B5A'

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()

  const connectionId = params?.id

  const [user, setUser] = useState(undefined)
  const [connection, setConnection] = useState(null)
  const [otherUser, setOtherUser] = useState(null)

  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push('/login')
        return
      }

      setUser(u)

      if (!connectionId) {
        setError('Conversation not found.')
        setLoading(false)
        return
      }

      await loadConnection(
        connectionId,
        u.uid
      )
    })

    return () => unsub()
  }, [connectionId, router])

  async function loadConnection(
    currentConnectionId,
    currentUid
  ) {
    setLoading(true)
    setError('')

    try {
      const connectionRef = doc(
        db,
        'connections',
        currentConnectionId
      )

      const connectionSnapshot =
        await getDoc(connectionRef)

      if (!connectionSnapshot.exists()) {
        setError('Conversation not found.')
        setLoading(false)
        return
      }

      const data = {
        id: connectionSnapshot.id,
        ...connectionSnapshot.data(),
      }

      const participants =
        Array.isArray(data.participants)
          ? data.participants
          : []

      if (!participants.includes(currentUid)) {
        setError(
          'You do not have access to this conversation.'
        )
        setLoading(false)
        return
      }

      if (data.status !== 'connected') {
        setError(
          'You can only message people who are connected with you.'
        )
        setLoading(false)
        return
      }

      setConnection(data)

      const otherUid =
        participants.find(
          (uid) => uid !== currentUid
        ) || ''

      if (otherUid) {
        const otherUserSnapshot =
          await getDoc(
            doc(
              db,
              'users',
              otherUid
            )
          )

        if (
          otherUserSnapshot.exists()
        ) {
          const person =
            otherUserSnapshot.data()

          setOtherUser({
            uid: otherUid,

            name:
              person.name ||
              person.displayName ||
              person.username ||
              'Ronda member',

            city:
              String(
                person.city || ''
              ).toUpperCase(),

            gender:
              person.gender ||
              '',

            photoURL:
              person.photoURL ||
              person.photo_url ||
              '/point.png',

            introduction:
              person.introduction ||
              person.bio ||
              '',
          })
        } else {
          setOtherUser({
            uid: otherUid,
            name: 'Ronda member',
            city: '',
            gender: '',
            photoURL: '/point.png',
            introduction: '',
          })
        }
      }

      setLoading(false)
    } catch (err) {
      console.error(
        'Error loading conversation:',
        err
      )

      setError(
        'Could not load this conversation.'
      )

      setLoading(false)
    }
  }

  useEffect(() => {
    if (
      !connectionId ||
      !user ||
      !connection ||
      connection.status !== 'connected'
    ) {
      return
    }

    const messagesQuery = query(
      collection(
        db,
        'connections',
        connectionId,
        'messages'
      ),
      orderBy(
        'created_at',
        'asc'
      )
    )

    const unsubscribe =
      onSnapshot(
        messagesQuery,
        (snapshot) => {
          const data =
            snapshot.docs.map(
              (messageDoc) => ({
                id: messageDoc.id,
                ...messageDoc.data(),
              })
            )

          setMessages(data)
        },
        (err) => {
          console.error(
            'Error loading messages:',
            err
          )

          setError(
            'Could not load messages.'
          )
        }
      )

    return () => unsubscribe()
  }, [
    connectionId,
    user,
    connection,
  ])

  async function handleSendMessage(
    event
  ) {
    event.preventDefault()

    if (
      !user ||
      !connection ||
      !connectionId ||
      sending
    ) {
      return
    }

    const text =
      message.trim()

    if (!text) {
      return
    }

    if (text.length > 1000) {
      window.alert(
        'Messages are limited to 1000 characters.'
      )
      return
    }

    setSending(true)

    try {
      await addDoc(
        collection(
          db,
          'connections',
          connectionId,
          'messages'
        ),
        {
          author_id:
            user.uid,

          text,

          created_at:
            serverTimestamp(),
        }
      )

      await updateDoc(
        doc(
          db,
          'connections',
          connectionId
        ),
        {
          lastMessage:
            text,

          lastMessageAt:
            serverTimestamp(),

          updated_at:
            serverTimestamp(),
        }
      )

      setMessage('')
    } catch (err) {
      console.error(
        'Error sending message:',
        err
      )

      window.alert(
        'Your message could not be sent.'
      )
    } finally {
      setSending(false)
    }
  }

  function genderColor(gender) {
    if (gender === 'female') {
      return '#E93C87'
    }

    if (gender === 'male') {
      return '#3478C5'
    }

    return '#343434'
  }

  function formatMessageTime(
    value
  ) {
    if (!value) return ''

    try {
      const date =
        typeof value.toDate ===
        'function'
          ? value.toDate()
          : new Date(value)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return ''
      }

      return date.toLocaleTimeString(
        [],
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    } catch {
      return ''
    }
  }

  const title =
    useMemo(
      () =>
        otherUser?.name ||
        'Conversation',
      [otherUser]
    )

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: '100vh',

          background:
            '#FFF8F2',

          padding:
            '115px 20px 50px',

          boxSizing:
            'border-box',
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
          }}
        >

          {loading ? (
            <div
              style={{
                minHeight: 500,

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,

                  border:
                    `3px solid ${CORAL}`,

                  borderTopColor:
                    'transparent',

                  borderRadius:
                    '50%',

                  animation:
                    'spin .7s linear infinite',
                }}
              />
            </div>
          ) : error ? (
            <div
              style={{
                padding: 28,

                background:
                  '#FFFFFF',

                border:
                  '1px solid #E9DDD4',

                borderRadius:
                  18,

                textAlign:
                  'center',
              }}
            >
              <p
                style={{
                  margin:
                    '0 0 18px',

                  color:
                    '#706965',

                  fontSize:
                    '0.88rem',
                }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/messages'
                  )
                }
                style={{
                  border:
                    'none',

                  background:
                    CORAL,

                  color:
                    '#FFFFFF',

                  padding:
                    '9px 18px',

                  borderRadius:
                    999,

                  cursor:
                    'pointer',

                  fontSize:
                    '0.8rem',

                  fontWeight:
                    650,
                }}
              >
                Back to messages
              </button>
            </div>
          ) : (
            <div
              style={{
                background:
                  '#FFFFFF',

                border:
                  '1px solid #E9DDD4',

                borderRadius:
                  20,

                overflow:
                  'hidden',

                boxShadow:
                  '0 12px 35px rgba(43,39,37,0.05)',
              }}
            >

              {/* HEADER */}

              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap: 13,

                  padding:
                    '14px 16px',

                  borderBottom:
                    '1px solid #F0EBE6',

                  background:
                    '#FFFFFF',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      '/messages'
                    )
                  }
                  style={{
                    border:
                      'none',

                    background:
                      'transparent',

                    color:
                      '#817A75',

                    cursor:
                      'pointer',

                    padding: 4,

                    fontSize:
                      '1rem',
                  }}
                >
                  ←
                </button>

                <img
                  src={
                    otherUser?.photoURL ||
                    '/point.png'
                  }
                  alt={title}
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      '/point.png'
                  }}
                  style={{
                    width: 44,
                    height: 44,

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
                      '0 2px 8px rgba(43,39,37,0.08)',
                  }}
                />

                <div
                  style={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                      fontSize:
                        '0.95rem',

                      fontWeight:
                        700,

                      color:
                        genderColor(
                          otherUser?.gender
                        ),

                      whiteSpace:
                        'nowrap',

                      overflow:
                        'hidden',

                      textOverflow:
                        'ellipsis',
                    }}
                  >
                    {title}

                    {otherUser?.gender ===
                    'female'
                      ? ' ♀'
                      : otherUser?.gender ===
                          'male'
                        ? ' ♂'
                        : ''}
                  </div>

                  {otherUser?.city && (
                    <div
                      style={{
                        marginTop:
                          2,

                        color:
                          '#A39C97',

                        fontSize:
                          '0.71rem',
                      }}
                    >
                      {otherUser.city}
                    </div>
                  )}
                </div>
              </div>


              {/* MESSAGES */}

              <div
                style={{
                  minHeight: 460,
                  maxHeight:
                    'calc(100vh - 330px)',

                  overflowY:
                    'auto',

                  padding:
                    '22px 16px',

                  background:
                    '#FAFCFD',
                }}
              >
                {messages.length ===
                0 ? (
                  <div
                    style={{
                      minHeight: 350,

                      display:
                        'flex',

                      flexDirection:
                        'column',

                      alignItems:
                        'center',

                      justifyContent:
                        'center',

                      textAlign:
                        'center',

                      color:
                        '#817A75',
                    }}
                  >
                    <div
                      style={{
                        fontFamily:
                          '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                        fontSize:
                          '1rem',

                        fontWeight:
                          700,

                        color:
                          '#2B2725',

                        marginBottom:
                          6,
                      }}
                    >
                      You’re connected.
                    </div>

                    <div
                      style={{
                        maxWidth:
                          320,

                        fontSize:
                          '0.8rem',

                        lineHeight:
                          1.5,
                      }}
                    >
                      Say hello to{' '}
                      {otherUser?.name ||
                        'your new connection'}.
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        'flex',

                      flexDirection:
                        'column',

                      gap: 9,
                    }}
                  >
                    {messages.map(
                      (item) => {
                        const mine =
                          item.author_id ===
                          user?.uid

                        return (
                          <div
                            key={
                              item.id
                            }
                            style={{
                              display:
                                'flex',

                              justifyContent:
                                mine
                                  ? 'flex-end'
                                  : 'flex-start',
                            }}
                          >
                            <div
                              style={{
                                maxWidth:
                                  '76%',

                                padding:
                                  '9px 12px',

                                borderRadius:
                                  mine
                                    ? '14px 14px 4px 14px'
                                    : '14px 14px 14px 4px',

                                background:
                                  mine
                                    ? CORAL
                                    : '#FFFFFF',

                                color:
                                  mine
                                    ? '#FFFFFF'
                                    : '#2B2725',

                                border:
                                  mine
                                    ? 'none'
                                    : '1px solid #E9DDD4',

                                fontFamily:
                                  '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                                fontSize:
                                  '0.85rem',

                                lineHeight:
                                  1.45,

                                boxShadow:
                                  mine
                                    ? '0 3px 10px rgba(255,107,90,0.12)'
                                    : '0 2px 7px rgba(43,39,37,0.04)',
                              }}
                            >
                              <div
                                style={{
                                  whiteSpace:
                                    'pre-wrap',

                                  overflowWrap:
                                    'anywhere',
                                }}
                              >
                                {
                                  item.text
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    4,

                                  textAlign:
                                    'right',

                                  fontSize:
                                    '0.62rem',

                                  opacity:
                                    0.7,
                                }}
                              >
                                {formatMessageTime(
                                  item.created_at
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    )}
                  </div>
                )}
              </div>


              {/* FORM */}

              <form
                onSubmit={
                  handleSendMessage
                }
                style={{
                  display:
                    'flex',

                  alignItems:
                    'flex-end',

                  gap: 10,

                  padding:
                    '12px 14px',

                  borderTop:
                    '1px solid #F0EBE6',

                  background:
                    '#FFFFFF',
                }}
              >
                <textarea
                  value={message}
                  onChange={(
                    event
                  ) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  placeholder="Write a message..."
                  rows={1}
                  maxLength={1000}
                  style={{
                    flex: 1,

                    minHeight:
                      42,

                    maxHeight:
                      120,

                    resize:
                      'vertical',

                    padding:
                      '10px 13px',

                    borderRadius:
                      16,

                    border:
                      '1px solid #E9DDD4',

                    outline:
                      'none',

                    background:
                      '#FAFCFD',

                    color:
                      '#2B2725',

                    fontFamily:
                      '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                    fontSize:
                      '0.85rem',

                    lineHeight:
                      1.4,

                    boxSizing:
                      'border-box',
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  style={{
                    flexShrink: 0,

                    minWidth: 78,

                    padding:
                      '10px 16px',

                    border:
                      'none',

                    borderRadius:
                      999,

                    background:
                      sending ||
                      !message.trim()
                        ? '#E9DDD4'
                        : CORAL,

                    color:
                      sending ||
                      !message.trim()
                        ? '#A39C97'
                        : '#FFFFFF',

                    cursor:
                      sending ||
                      !message.trim()
                        ? 'default'
                        : 'pointer',

                    fontFamily:
                      '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                    fontSize:
                      '0.78rem',

                    fontWeight:
                      650,

                    transition:
                      'background .18s ease',
                  }}
                >
                  {sending
                    ? 'Sending...'
                    : 'Send'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}