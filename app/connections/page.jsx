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
        className={
          index % 2 === 0
            ? 'connection-row connection-row-even'
            : 'connection-row connection-row-odd'
        }
      >
        <div className="connection-person">

          <img
            src={person.photoURL || '/point.png'}
            alt={person.name}
            onError={(event) => {
              event.currentTarget.src =
                '/point.png'
            }}
            className="connection-avatar"
          />

          <div className="connection-info">

            <div className="connection-name-line">

              <span
                className="connection-name"
                style={{
                  color: genderColor(
                    person.gender
                  ),
                }}
              >
                {person.name}
              </span>

              {person.gender && (
                <span className="connection-gender">
                  {person.gender === 'female'
                    ? '♀'
                    : person.gender === 'male'
                      ? '♂'
                      : ''}
                </span>
              )}

            </div>

            {person.city && (
              <div className="connection-city">
                {person.city}
              </div>
            )}

            {person.intentions.length > 0 && (
              <div className="connection-intentions">
                {person.intentions
                  .slice(0, 5)
                  .join(' · ')}
              </div>
            )}

          </div>

        </div>


        <div className="connection-actions">

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
                className="connection-button connection-button-secondary"
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
                className="connection-button connection-button-primary"
              >
                {processingId === connection.id
                  ? '...'
                  : 'Accept'}
              </button>
            </>
          )}


          {mode === 'sent' && (
            <span className="connection-pending">
              Pending
            </span>
          )}


          {mode === 'connected' && (
            <Link
              href={`/messages/${connection.id}`}
              className="connection-message"
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

      <main className="connections-page">

        <div className="connections-container">


          {/* HEADER */}

          <div className="connections-header">

            <h1>
              Connections
            </h1>

            <p>
              Connect with people you want to know.
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="connections-error">
              {error}
            </div>
          )}


          {/* LOADING */}

          {loading ? (

            <div className="connections-loading">

              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className={
                    index % 2 === 0
                      ? 'connection-skeleton connection-skeleton-even'
                      : 'connection-skeleton connection-skeleton-odd'
                  }
                />
              ))}

            </div>

          ) : (
            <>


              {/* RECEIVED */}

              <section className="connections-section">

                <div className="connections-section-heading">

                  <h2>
                    Requests
                  </h2>

                  <span className="connections-count">
                    {received.length}
                  </span>

                </div>


                {received.length === 0 ? (

                  <div className="connections-empty">
                    No new connection requests.
                  </div>

                ) : (

                  <div className="connections-list">

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

              <section className="connections-section">

                <div className="connections-section-heading">

                  <h2>
                    Your connections
                  </h2>

                  <span className="connections-count connections-count-coral">
                    {connected.length} / 20
                  </span>

                </div>


                {connected.length === 0 ? (

                  <div className="connections-empty">

                    You don't have any connections yet.{' '}

                    <Link
                      href="/members"
                      className="connections-discover"
                    >
                      Discover people →
                    </Link>

                  </div>

                ) : (

                  <div className="connections-list">

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

                <section className="connections-section connections-section-last">

                  <div className="connections-section-heading">

                    <h2>
                      Sent requests
                    </h2>

                    <span className="connections-count">
                      {sent.length}
                    </span>

                  </div>


                  <div className="connections-list">

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


      <style jsx global>{`

        /* ================================================================
           PAGE
        ================================================================= */

        .connections-page {
          width: 100%;
          max-width: 100%;

          min-height: 100vh;

          padding:
            125px 20px 70px;

          box-sizing:
            border-box;

          background:
            #FFFFFF;

          overflow-x:
            hidden;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          color:
            #25211F;
        }


        .connections-container {
          width: 100%;

          max-width: 900px;

          min-width: 0;

          margin:
            0 auto;

          box-sizing:
            border-box;
        }


        /* ================================================================
           HEADER
        ================================================================= */

        .connections-header {
          width: 100%;

          min-width: 0;

          margin-bottom:
            38px;
        }


        .connections-header h1 {
          margin:
            0 0 8px;

          color:
            #25211F;

          font-size:
            clamp(
              2rem,
              5vw,
              2.7rem
            );

          font-weight:
            750;

          line-height:
            1.08;

          letter-spacing:
            -0.035em;
        }


        .connections-header p {
          margin:
            0;

          color:
            #746F6B;

          font-size:
            0.9rem;

          line-height:
            1.5;
        }


        /* ================================================================
           ERROR
        ================================================================= */

        .connections-error {
          width:
            100%;

          padding:
            12px 16px;

          margin-bottom:
            24px;

          box-sizing:
            border-box;

          border:
            1px solid
            #FFD8D1;

          border-radius:
            12px;

          background:
            #FFF5F2;

          color:
            #FF6B5A;

          font-size:
            0.82rem;
        }


        /* ================================================================
           SECTION
        ================================================================= */

        .connections-section {
          width:
            100%;

          min-width:
            0;

          margin-bottom:
            38px;
        }


        .connections-section-last {
          margin-bottom:
            0;
        }


        .connections-section-heading {
          display:
            flex;

          align-items:
            baseline;

          justify-content:
            space-between;

          width:
            100%;

          min-width:
            0;

          gap:
            15px;

          margin-bottom:
            13px;
        }


        .connections-section-heading h2 {
          min-width:
            0;

          margin:
            0;

          color:
            #25211F;

          font-size:
            1.08rem;

          font-weight:
            700;

          line-height:
            1.3;

          letter-spacing:
            -0.02em;
        }


        .connections-count {
          flex-shrink:
            0;

          color:
            #9A9591;

          font-size:
            0.74rem;

          font-weight:
            550;
        }


        .connections-count-coral {
          color:
            #FF6B5A;

          font-weight:
            700;
        }


        /* ================================================================
           LIST
        ================================================================= */

        .connections-list,
        .connections-loading {
          display:
            grid;

          grid-template-columns:
            minmax(
              0,
              1fr
            );

          width:
            100%;

          min-width:
            0;

          gap:
            8px;
        }


        /* ================================================================
           ROW
        ================================================================= */

        .connection-row {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          width:
            100%;

          max-width:
            100%;

          min-width:
            0;

          gap:
            18px;

          padding:
            13px 14px;

          box-sizing:
            border-box;

          border:
            1px solid
            #EBE4DF;

          border-radius:
            16px;

          overflow:
            hidden;

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }


        .connection-row-even {
          background:
            #FFFFFF;
        }


        .connection-row-odd {
          background:
            #FFF9F7;
        }


        .connection-row:hover {
          transform:
            translateY(-1px);

          border-color:
            #DDD4CE;

          box-shadow:
            0 6px 18px
            rgba(
              32,
              24,
              20,
              0.045
            );
        }


        /* ================================================================
           PERSON
        ================================================================= */

        .connection-person {
          display:
            flex;

          align-items:
            center;

          flex:
            1 1 auto;

          min-width:
            0;

          gap:
            13px;

          overflow:
            hidden;
        }


        .connection-avatar {
          width:
            52px;

          height:
            52px;

          flex:
            0 0 52px;

          box-sizing:
            border-box;

          border:
            1px solid
            #F0EAE6;

          border-radius:
            15px;

          object-fit:
            cover;

          object-position:
            center;

          background:
            #F8F5F3;

          box-shadow:
            0 2px 8px
            rgba(
              43,
              39,
              37,
              0.055
            );
        }


        .connection-info {
          flex:
            1 1 auto;

          min-width:
            0;

          overflow:
            hidden;
        }


        .connection-name-line {
          display:
            flex;

          align-items:
            baseline;

          min-width:
            0;

          gap:
            5px;

          overflow:
            hidden;
        }


        .connection-name {
          display:
            block;

          min-width:
            0;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;

          font-size:
            0.92rem;

          font-weight:
            700;

          line-height:
            1.35;
        }


        .connection-gender {
          flex-shrink:
            0;

          color:
            #817A75;

          font-size:
            0.78rem;

          font-weight:
            600;
        }


        .connection-city {
          margin-top:
            2px;

          color:
            #817A75;

          font-size:
            0.71rem;

          font-weight:
            500;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }


        .connection-intentions {
          margin-top:
            3px;

          color:
            #FF6B5A;

          font-size:
            0.71rem;

          font-weight:
            550;

          white-space:
            nowrap;

          overflow:
            hidden;

          text-overflow:
            ellipsis;
        }


        /* ================================================================
           ACTIONS
        ================================================================= */

        .connection-actions {
          display:
            flex;

          align-items:
            center;

          justify-content:
            flex-end;

          flex-shrink:
            0;

          gap:
            8px;
        }


        .connection-button,
        .connection-message,
        .connection-pending {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          min-height:
            34px;

          min-width:
            82px;

          padding:
            0 15px;

          box-sizing:
            border-box;

          border-radius:
            999px;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size:
            0.72rem;

          font-weight:
            650;

          white-space:
            nowrap;
        }


        .connection-button {
          cursor:
            pointer;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }


        .connection-button:disabled {
          cursor:
            default;

          opacity:
            0.65;
        }


        .connection-button-secondary {
          border:
            1px solid
            #E6DDD8;

          background:
            #FFFFFF;

          color:
            #706965;
        }


        .connection-button-secondary:hover:not(:disabled) {
          border-color:
            #FFBDB3;

          color:
            #FF6B5A;

          background:
            #FFF9F7;
        }


        .connection-button-primary {
          border:
            1px solid
            #FF6B5A;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          box-shadow:
            0 3px 9px
            rgba(
              255,
              107,
              90,
              0.12
            );
        }


        .connection-button-primary:hover:not(:disabled) {
          background:
            #F45F4F;

          border-color:
            #F45F4F;

          transform:
            translateY(-1px);
        }


        .connection-message {
          border:
            1px solid
            #FF6B5A;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          text-decoration:
            none;

          box-shadow:
            0 3px 9px
            rgba(
              255,
              107,
              90,
              0.12
            );

          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }


        .connection-message:hover {
          background:
            #F45F4F;

          border-color:
            #F45F4F;

          transform:
            translateY(-1px);
        }


        .connection-pending {
          border:
            1px solid
            #FFD9D2;

          background:
            #FFF4F1;

          color:
            #FF6B5A;
        }


        /* ================================================================
           EMPTY
        ================================================================= */

        .connections-empty {
          width:
            100%;

          padding:
            18px;

          box-sizing:
            border-box;

          border:
            1px solid
            #F0EAE6;

          border-radius:
            14px;

          background:
            #FFF9F7;

          color:
            #817A75;

          font-size:
            0.81rem;

          line-height:
            1.5;
        }


        .connections-discover {
          color:
            #FF6B5A;

          font-weight:
            650;

          text-decoration:
            none;
        }


        .connections-discover:hover {
          color:
            #F45F4F;
        }


        /* ================================================================
           SKELETON
        ================================================================= */

        .connection-skeleton {
          width:
            100%;

          height:
            78px;

          box-sizing:
            border-box;

          border:
            1px solid
            #F0EAE6;

          border-radius:
            16px;

          animation:
            pulse 1.4s infinite;
        }


        .connection-skeleton-even {
          background:
            #FFFFFF;
        }


        .connection-skeleton-odd {
          background:
            #FFF9F7;
        }


        /* ================================================================
           TABLET
        ================================================================= */

        @media (max-width: 820px) {

          .connections-page {
            padding:
              120px 16px 56px;
          }


          .connections-header {
            margin-bottom:
              32px;
          }


          .connection-row {
            gap:
              14px;
          }

        }


        /* ================================================================
           MOBILE
        ================================================================= */

        @media (max-width: 640px) {

          .connections-page {
            padding:
              112px 12px 44px;
          }


          .connections-container {
            max-width:
              100%;
          }


          .connections-header {
            margin-bottom:
              28px;
          }


          .connections-header h1 {
            font-size:
              1.75rem;
          }


          .connections-header p {
            font-size:
              0.82rem;
          }


          .connections-section {
            margin-bottom:
              30px;
          }


          .connection-row {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              12px;

            padding:
              12px;

            border-radius:
              14px;
          }


          .connection-person {
            width:
              100%;

            gap:
              11px;
          }


          .connection-avatar {
            width:
              48px;

            height:
              48px;

            flex-basis:
              48px;

            border-radius:
              13px;
          }


          .connection-name {
            font-size:
              0.86rem;
          }


          .connection-city {
            font-size:
              0.68rem;
          }


          .connection-intentions {
            font-size:
              0.68rem;
          }


          .connection-actions {
            width:
              100%;

            justify-content:
              flex-end;
          }


          .connection-button,
          .connection-message,
          .connection-pending {
            min-height:
              33px;

            min-width:
              78px;

            padding:
              0 14px;

            font-size:
              0.7rem;
          }

        }


        /* ================================================================
           SMALL MOBILE
        ================================================================= */

        @media (max-width: 420px) {

          .connections-page {
            padding-left:
              10px;

            padding-right:
              10px;
          }


          .connection-row {
            padding:
              10px;
          }


          .connection-avatar {
            width:
              44px;

            height:
              44px;

            flex-basis:
              44px;

            border-radius:
              12px;
          }


          .connection-actions {
            gap:
              6px;
          }


          .connection-button,
          .connection-message,
          .connection-pending {
            min-width:
              74px;

            padding:
              0 12px;
          }

        }


        /* ================================================================
           VERY SMALL MOBILE
        ================================================================= */

        @media (max-width: 360px) {

          .connections-page {
            padding-left:
              8px;

            padding-right:
              8px;
          }


          .connection-avatar {
            width:
              42px;

            height:
              42px;

            flex-basis:
              42px;
          }


          .connection-name {
            font-size:
              0.82rem;
          }


          .connection-actions {
            width:
              100%;
          }


          .connection-button,
          .connection-message,
          .connection-pending {
            flex:
              1 1 auto;

            min-width:
              0;
          }

        }


        /* ================================================================
           ANIMATION
        ================================================================= */

        @keyframes pulse {

          0%,
          100% {
            opacity:
              1;
          }

          50% {
            opacity:
              0.5;
          }

        }

      `}</style>
    </>
  )
}
