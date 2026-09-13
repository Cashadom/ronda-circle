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

      <main className="messages-page">
        <div className="messages-container">

          <div className="messages-header">
            <h1>
              Messages
            </h1>

            <p>
              Conversations with your Ronda connections.
            </p>
          </div>


          {error && (
            <div className="messages-error">
              {error}
            </div>
          )}


          {loading ? (
            <div className="messages-list">

              {Array.from({
                length: 7,
              }).map((_, index) => (
                <div
                  key={index}
                  className={
                    index % 2 === 0
                      ? 'message-skeleton message-skeleton-odd'
                      : 'message-skeleton message-skeleton-even'
                  }
                />
              ))}

            </div>

          ) : conversations.length === 0 ? (

            <div className="messages-empty">

              <h2>
                No conversations yet
              </h2>

              <p>
                Connect with people first. Once they accept, you can message each other.
              </p>

              <Link
                href="/members"
                className="messages-discover"
              >
                Discover people
              </Link>

            </div>

          ) : (

            <div className="messages-list">

              {conversations.map(
                (conversation, index) => {
                  const person =
                    conversation.person

                  return (
                    <Link
                      key={conversation.id}
                      href={`/messages/${conversation.id}`}
                      className={
                        index % 2 === 0
                          ? 'conversation-row conversation-row-odd'
                          : 'conversation-row conversation-row-even'
                      }
                    >

                      <div className="conversation-person">

                        <img
                          src={
                            person.photoURL ||
                            '/point.png'
                          }
                          alt={person.name}
                          onError={(event) => {
                            event.currentTarget.src =
                              '/point.png'
                          }}
                          className="conversation-avatar"
                        />


                        <div className="conversation-content">

                          <div className="conversation-heading">

                            <span
                              className="conversation-name"
                              style={{
                                color:
                                  genderColor(
                                    person.gender
                                  ),
                              }}
                            >
                              {person.name}
                            </span>

                            {person.city && (
                              <span className="conversation-city">
                                · {person.city}
                              </span>
                            )}

                          </div>


                          <div
                            className={
                              conversation.lastMessage
                                ? 'conversation-preview'
                                : 'conversation-preview conversation-preview-empty'
                            }
                          >
                            {conversation.lastMessage ||
                              'You are connected. Say hello.'}
                          </div>

                        </div>

                      </div>


                      <div className="conversation-date">
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


          <div className="messages-footer-link">

            <Link href="/connections">
              Manage connections →
            </Link>

          </div>

        </div>
      </main>

      <Footer />


      <style jsx>{`

        /* ==================================================================
           PAGE
        ================================================================== */

        .messages-page {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;

          padding: 125px 20px 70px;

          box-sizing: border-box;

          background: #FFFFFF;

          overflow-x: hidden;
        }


        .messages-container {
          width: 100%;
          max-width: 850px;
          min-width: 0;

          margin: 0 auto;

          box-sizing: border-box;
        }


        /* ==================================================================
           HEADER
        ================================================================== */

        .messages-header {
          width: 100%;
          min-width: 0;

          margin-bottom: 30px;
        }


        .messages-header h1 {
          margin: 0 0 8px;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: clamp(
            2rem,
            5vw,
            2.7rem
          );

          font-weight: 750;

          line-height: 1.08;

          letter-spacing: -0.035em;

          color: #25211F;
        }


        .messages-header p {
          margin: 0;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: 0.9rem;
          font-weight: 450;

          line-height: 1.5;

          color: #746F6B;
        }


        /* ==================================================================
           ERROR
        ================================================================== */

        .messages-error {
          width: 100%;

          padding: 12px 16px;
          margin-bottom: 24px;

          box-sizing: border-box;

          border: 1px solid #FFD7D0;
          border-radius: 12px;

          background: #FFF5F2;

          color: #FF6B5A;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.82rem;
        }


        /* ==================================================================
           LIST
        ================================================================== */

        .messages-list {
          display: grid;
          grid-template-columns: minmax(0, 1fr);

          width: 100%;
          min-width: 0;

          gap: 8px;
        }


        /* ==================================================================
           SKELETON
        ================================================================== */

        .message-skeleton {
          width: 100%;
          height: 72px;

          box-sizing: border-box;

          border-radius: 14px;

          animation: pulse 1.4s infinite;
        }


        .message-skeleton-odd {
          background: #FFFFFF;

          border: 1px solid #EBE4DF;
        }


        .message-skeleton-even {
          background: #FFF9F7;

          border: 1px solid #F2EAE6;
        }


        /* ==================================================================
           CONVERSATION ROW
        ================================================================== */

        .conversation-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          width: 100%;
          max-width: 100%;
          min-width: 0;

          gap: 14px;

          padding: 12px 14px;

          box-sizing: border-box;

          border-radius: 16px;

          text-decoration: none;

          overflow: hidden;

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }


        .conversation-row-odd {
          background: #FFFFFF;

          border: 1px solid #EBE4DF;
        }


        .conversation-row-even {
          background: #FFF9F7;

          border: 1px solid #F2EAE6;
        }


        .conversation-row:hover {
          transform: translateY(-1px);

          border-color: #DDD4CE;

          box-shadow:
            0 6px 18px
            rgba(
              32,
              24,
              20,
              0.045
            );
        }


        /* ==================================================================
           PERSON
        ================================================================== */

        .conversation-person {
          display: flex;
          align-items: center;

          flex: 1 1 auto;

          width: 0;
          min-width: 0;

          gap: 12px;

          overflow: hidden;
        }


        .conversation-avatar {
          width: 48px;
          height: 48px;

          flex: 0 0 48px;

          box-sizing: border-box;

          border: 2px solid #FFFFFF;
          border-radius: 14px;

          object-fit: cover;
          object-position: center;

          background: #F8F5F3;

          box-shadow:
            0 2px 8px
            rgba(
              43,
              39,
              37,
              0.07
            );
        }


        /* ==================================================================
           CONTENT
        ================================================================== */

        .conversation-content {
          flex: 1 1 auto;

          width: 0;
          min-width: 0;

          overflow: hidden;
        }


        .conversation-heading {
          display: flex;
          align-items: baseline;

          width: 100%;
          min-width: 0;

          gap: 5px;

          margin-bottom: 3px;

          overflow: hidden;
        }


        .conversation-name {
          display: block;

          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;
          white-space: nowrap;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: 0.9rem;
          font-weight: 700;

          line-height: 1.35;
        }


        .conversation-city {
          flex: 0 1 auto;

          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;
          white-space: nowrap;

          color: #9A9591;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.7rem;
          font-weight: 500;
        }


        .conversation-preview {
          width: 100%;
          min-width: 0;

          overflow: hidden;

          text-overflow: ellipsis;
          white-space: nowrap;

          color: #746F6B;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.77rem;
          font-weight: 450;

          line-height: 1.45;
        }


        .conversation-preview-empty {
          color: #A19B97;
        }


        /* ==================================================================
           DATE
        ================================================================== */

        .conversation-date {
          flex: 0 0 auto;

          max-width: 78px;

          overflow: hidden;

          text-overflow: ellipsis;
          white-space: nowrap;

          color: #9A9591;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.68rem;
          font-weight: 500;

          text-align: right;
        }


        /* ==================================================================
           EMPTY STATE
        ================================================================== */

        .messages-empty {
          width: 100%;

          padding: 34px 22px;

          box-sizing: border-box;

          border: 1px solid #EBE4DF;
          border-radius: 18px;

          background: #FFFFFF;

          text-align: center;
        }


        .messages-empty h2 {
          margin: 0 0 8px;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 1.05rem;
          font-weight: 700;

          color: #25211F;
        }


        .messages-empty p {
          max-width: 520px;

          margin: 0 auto 18px;

          color: #817A75;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.84rem;

          line-height: 1.5;
        }


        .messages-discover {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          min-height: 38px;

          padding: 0 18px;

          border-radius: 999px;

          background: #FF6B5A;

          color: #FFFFFF;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.78rem;
          font-weight: 700;

          text-decoration: none;

          transition:
            background 0.18s ease,
            transform 0.18s ease;
        }


        .messages-discover:hover {
          background: #F45F4F;

          transform: translateY(-1px);
        }


        /* ==================================================================
           FOOTER LINK
        ================================================================== */

        .messages-footer-link {
          width: 100%;

          margin-top: 28px;

          text-align: center;
        }


        .messages-footer-link a {
          color: #FF6B5A;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 0.8rem;
          font-weight: 600;

          text-decoration: none;
        }


        .messages-footer-link a:hover {
          color: #F45F4F;
        }


        /* ==================================================================
           TABLET
        ================================================================== */

        @media (max-width: 820px) {

          .messages-page {
            padding:
              120px 16px 56px;
          }


          .messages-header {
            margin-bottom: 26px;
          }

        }


        /* ==================================================================
           MOBILE
        ================================================================== */

        @media (max-width: 640px) {

          .messages-page {
            padding:
              112px 12px 44px;
          }


          .messages-container {
            width: 100%;
            max-width: 100%;
            min-width: 0;
          }


          .messages-header {
            margin-bottom: 22px;
          }


          .messages-header h1 {
            font-size: 1.75rem;

            letter-spacing: -0.03em;
          }


          .messages-header p {
            font-size: 0.82rem;
          }


          .conversation-row {
            gap: 9px;

            padding: 10px;

            border-radius: 14px;
          }


          .conversation-person {
            gap: 10px;
          }


          .conversation-avatar {
            width: 44px;
            height: 44px;

            flex-basis: 44px;

            border-radius: 12px;
          }


          .conversation-name {
            font-size: 0.84rem;
          }


          .conversation-city {
            font-size: 0.64rem;
          }


          .conversation-preview {
            font-size: 0.72rem;
          }


          .conversation-date {
            max-width: 62px;

            font-size: 0.62rem;
          }


          .messages-empty {
            padding: 28px 18px;
          }

        }


        /* ==================================================================
           SMALL MOBILE
        ================================================================== */

        @media (max-width: 420px) {

          .messages-page {
            padding-left: 10px;
            padding-right: 10px;
          }


          .conversation-row {
            gap: 7px;

            padding: 9px;
          }


          .conversation-avatar {
            width: 40px;
            height: 40px;

            flex-basis: 40px;

            border-radius: 11px;
          }


          .conversation-person {
            gap: 9px;
          }


          .conversation-city {
            display: none;
          }


          .conversation-date {
            max-width: 52px;

            font-size: 0.59rem;
          }

        }


        /* ==================================================================
           VERY SMALL MOBILE
        ================================================================== */

        @media (max-width: 360px) {

          .messages-page {
            padding-left: 8px;
            padding-right: 8px;
          }


          .conversation-row {
            padding: 8px;
          }


          .conversation-avatar {
            width: 38px;
            height: 38px;

            flex-basis: 38px;
          }


          .conversation-name {
            font-size: 0.8rem;
          }


          .conversation-preview {
            font-size: 0.68rem;
          }


          .conversation-date {
            max-width: 46px;

            font-size: 0.56rem;
          }

        }


        /* ==================================================================
           ANIMATION
        ================================================================== */

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
