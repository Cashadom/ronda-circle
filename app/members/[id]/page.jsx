'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'
import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

export default function MemberProfilePage() {
  const params = useParams()

  const memberId = params?.id || ''

  const [currentUser, setCurrentUser] = useState(null)
  const [member, setMember] = useState(null)

  const [loading, setLoading] = useState(true)
  const [connection, setConnection] = useState(null)
  const [loadingConnection, setLoadingConnection] = useState(true)
  const [processing, setProcessing] = useState(false)

  /* ─────────────────────────────────────────────
     AUTH
  ───────────────────────────────────────────── */

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setCurrentUser(user || null)
    })

    return () => unsub()
  }, [])

  /* ─────────────────────────────────────────────
     LOAD MEMBER
  ───────────────────────────────────────────── */

  useEffect(() => {
    async function loadMember() {
      if (!memberId) return

      try {
        const snapshot = await getDoc(
          doc(db, 'users', memberId)
        )

        if (!snapshot.exists()) {
          setMember(null)
          return
        }

        setMember({
          id: snapshot.id,
          ...snapshot.data(),
        })
      } catch (err) {
        console.error('Error loading member:', err)
        setMember(null)
      } finally {
        setLoading(false)
      }
    }

    loadMember()
  }, [memberId])

  /* ─────────────────────────────────────────────
     CONNECTION ID
  ───────────────────────────────────────────── */

  const connectionId = useMemo(() => {
    if (!currentUser?.uid || !memberId) {
      return ''
    }

    return [currentUser.uid, memberId]
      .sort()
      .join('_')
  }, [currentUser, memberId])

  /* ─────────────────────────────────────────────
     LOAD CONNECTION
  ───────────────────────────────────────────── */

  useEffect(() => {
    async function loadConnection() {
      if (
        !currentUser?.uid ||
        !memberId ||
        currentUser.uid === memberId ||
        !connectionId
      ) {
        setConnection(null)
        setLoadingConnection(false)
        return
      }

      setLoadingConnection(true)

      try {
        const snapshot = await getDoc(
          doc(db, 'connections', connectionId)
        )

        if (snapshot.exists()) {
          setConnection({
            id: snapshot.id,
            ...snapshot.data(),
          })
        } else {
          setConnection(null)
        }
      } catch (err) {
        console.error(
          'Error loading connection:',
          err
        )

        setConnection(null)
      } finally {
        setLoadingConnection(false)
      }
    }

    loadConnection()
  }, [
    currentUser,
    memberId,
    connectionId,
  ])

  /* ─────────────────────────────────────────────
     CONNECT
  ───────────────────────────────────────────── */

  async function handleConnect() {
    if (
      !currentUser?.uid ||
      !memberId ||
      currentUser.uid === memberId ||
      !connectionId ||
      processing
    ) {
      return
    }

    setProcessing(true)

    try {
      const intention =
        Array.isArray(member?.intentions) &&
        member.intentions.length
          ? member.intentions[0]
          : ''

      const newConnection = {
        participants: [
          currentUser.uid,
          memberId,
        ],

        requestedBy: currentUser.uid,

        status: 'pending',

        intention,

        created_at: serverTimestamp(),

        updated_at: serverTimestamp(),
      }

      await setDoc(
        doc(
          db,
          'connections',
          connectionId
        ),
        newConnection
      )

      setConnection({
        id: connectionId,

        participants: [
          currentUser.uid,
          memberId,
        ],

        requestedBy: currentUser.uid,

        status: 'pending',

        intention,
      })
    } catch (err) {
      console.error(
        'Error creating connection:',
        err
      )

      window.alert(
        'The connection request could not be sent.'
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ─────────────────────────────────────────────
     ACCEPT CONNECTION
  ───────────────────────────────────────────── */

  async function handleAccept() {
    if (
      !currentUser?.uid ||
      !connectionId ||
      !connection ||
      processing
    ) {
      return
    }

    setProcessing(true)

    try {
      await updateDoc(
        doc(
          db,
          'connections',
          connectionId
        ),
        {
          status: 'connected',

          connected_at:
            serverTimestamp(),

          updated_at:
            serverTimestamp(),
        }
      )

      setConnection((current) => ({
        ...current,
        status: 'connected',
      }))
    } catch (err) {
      console.error(
        'Error accepting connection:',
        err
      )

      window.alert(
        'The connection could not be accepted.'
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ─────────────────────────────────────────────
     ACTION BUTTON
  ───────────────────────────────────────────── */

  function renderAction() {
    if (!currentUser) {
      return (
        <Link
          href="/login"
          className="member-action-primary"
        >
          Connect
        </Link>
      )
    }

    if (currentUser.uid === memberId) {
      return (
        <Link
          href="/profile"
          className="member-action-secondary"
        >
          Edit profile
        </Link>
      )
    }

    if (loadingConnection) {
      return (
        <span
          className="member-action-secondary"
          style={{
            opacity: 0.6,
          }}
        >
          Loading...
        </span>
      )
    }

    if (!connection) {
      return (
        <button
          type="button"
          className="member-action-primary"
          onClick={handleConnect}
          disabled={processing}
        >
          {processing
            ? 'Sending...'
            : 'Connect'}
        </button>
      )
    }

    if (
      connection.status === 'pending' &&
      connection.requestedBy === currentUser.uid
    ) {
      return (
        <span className="member-action-secondary">
          Pending
        </span>
      )
    }

    if (
      connection.status === 'pending' &&
      connection.requestedBy !== currentUser.uid
    ) {
      return (
        <button
          type="button"
          className="member-action-primary"
          onClick={handleAccept}
          disabled={processing}
        >
          {processing
            ? 'Accepting...'
            : 'Accept'}
        </button>
      )
    }

    if (connection.status === 'connected') {
      return (
        <Link
          href={`/messages/${connectionId}`}
          className="member-action-primary"
        >
          Message
        </Link>
      )
    }

    return null
  }

  /* ─────────────────────────────────────────────
     LOADING
  ───────────────────────────────────────────── */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="member-page">
          <div className="member-card">
            Loading profile...
          </div>
        </main>

        <Footer />
      </>
    )
  }

  /* ─────────────────────────────────────────────
     PROFILE NOT FOUND
  ───────────────────────────────────────────── */

  if (!member) {
    return (
      <>
        <Navbar />

        <main className="member-page">
          <div className="member-card">

            <h1>Profile not found</h1>

            <Link
              href="/members"
              className="member-back-link"
            >
              ← Back to people
            </Link>

          </div>
        </main>

        <Footer />
      </>
    )
  }

  /* ─────────────────────────────────────────────
     PROFILE DATA
  ───────────────────────────────────────────── */

  const name =
    member.displayName ||
    member.name ||
    member.username ||
    'Ronda member'

  const city =
    member.city || ''

  const photo =
    member.photoURL ||
    member.photo_url ||
    '/point.png'

  const gender =
    member.gender || ''

  const introduction =
    member.introduction ||
    member.bio ||
    ''

  const intention =
    Array.isArray(member.intentions) &&
    member.intentions.length
      ? member.intentions[0]
      : ''

  /*
   * We consider the profile completed enough
   * when at least one useful profile field exists.
   */

  const hasProfileDetails =
    Boolean(
      city ||
      gender ||
      intention ||
      introduction
    )

  /* ─────────────────────────────────────────────
     PAGE
  ───────────────────────────────────────────── */

  return (
    <>
      <Navbar />

      <main className="member-page">

        <div className="member-card">

          <Link
            href="/members"
            className="member-back-link"
          >
            ← Back to people
          </Link>

          <img
            src={photo}
            alt={name}
            className="member-photo"
            onError={(event) => {
              event.currentTarget.src =
                '/point.png'
            }}
          />

          <h1 className="member-name">
            {name}
          </h1>

          {(city || gender) && (
            <div className="member-meta">

              {city && (
                <span>
                  {String(city).toUpperCase()}
                </span>
              )}

              {city && gender && (
                <span className="member-separator">
                  ·
                </span>
              )}

              {gender && (
                <span>
                  {gender === 'female'
                    ? 'Female'
                    : gender === 'male'
                      ? 'Male'
                      : 'Prefer not to say'}
                </span>
              )}

            </div>
          )}

          {intention && (
            <div className="member-intention">

              Looking to meet people for

              <strong>
                {' '}
                {intention}
              </strong>

            </div>
          )}

          {introduction && (
            <p className="member-introduction">
              {introduction}
            </p>
          )}

          {!hasProfileDetails && (
            <p className="member-incomplete">
              This member hasn&apos;t completed
              their profile yet.
            </p>
          )}

          <div className="member-actions">
            {renderAction()}
          </div>

        </div>

      </main>

      <Footer />

      <style jsx global>{`

        .member-page {
          min-height: 100vh;

          padding:
            145px 20px 70px;

          background:
            #FFF8F2;

          box-sizing:
            border-box;
        }


        .member-card {
          width: 100%;
          max-width: 520px;

          margin:
            0 auto;

          padding:
            34px;

          background:
            #FFFFFF;

          border:
            1px solid #E9DDD4;

          border-radius:
            22px;

          text-align:
            center;

          box-sizing:
            border-box;
        }


        .member-back-link {
          display:
            block;

          text-align:
            left;

          margin-bottom:
            24px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.78rem;

          color:
            #817A75;

          text-decoration:
            none;
        }


        .member-back-link:hover {
          color:
            #FF6B5A;
        }


        .member-photo {
          width:
            112px;

          height:
            112px;

          border-radius:
            50%;

          object-fit:
            cover;

          background:
            #FFFFFF;

          border:
            4px solid #FFFFFF;

          box-shadow:
            0 0 0 1px #E9DDD4;

          margin-bottom:
            18px;
        }


        .member-name {
          margin:
            0 0 7px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            1.65rem;

          font-weight:
            700;

          color:
            #2B2725;
        }


        .member-meta {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            6px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.8rem;

          color:
            #817A75;

          margin-bottom:
            18px;
        }


        .member-separator {
          color:
            #C4BDB8;
        }


        .member-intention {
          display:
            inline-block;

          margin:
            0 auto 18px;

          padding:
            7px 14px;

          border-radius:
            999px;

          background:
            #FFF0EB;

          color:
            #817A75;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.8rem;
        }


        .member-intention strong {
          color:
            #FF6B5A;

          text-transform:
            capitalize;
        }


        .member-introduction {
          max-width:
            390px;

          margin:
            0 auto 26px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.88rem;

          line-height:
            1.6;

          color:
            #5F5A56;
        }


        .member-incomplete {
          max-width:
            340px;

          margin:
            4px auto 24px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.8rem;

          line-height:
            1.5;

          color:
            #9A918B;
        }


        .member-actions {
          display:
            flex;

          justify-content:
            center;

          margin-top:
            8px;
        }


        .member-action-primary,
        .member-action-secondary {
          min-width:
            140px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            11px 24px;

          border-radius:
            999px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size:
            0.84rem;

          font-weight:
            600;

          text-decoration:
            none;

          cursor:
            pointer;

          box-sizing:
            border-box;
        }


        .member-action-primary {
          color:
            #FFFFFF;

          background:
            #FF6B5A;

          border:
            1px solid #FF6B5A;
        }


        .member-action-primary:hover {
          background:
            #F45542;

          border-color:
            #F45542;
        }


        .member-action-primary:disabled {
          opacity:
            0.65;

          cursor:
            default;
        }


        .member-action-secondary {
          color:
            #817A75;

          background:
            #F7F3F0;

          border:
            1px solid #E9DDD4;
        }


        @media (max-width: 640px) {

          .member-page {
            padding:
              135px 14px 50px;
          }


          .member-card {
            padding:
              26px 20px;

            border-radius:
              18px;
          }


          .member-photo {
            width:
              96px;

            height:
              96px;
          }


          .member-name {
            font-size:
              1.4rem;
          }


          .member-introduction {
            font-size:
              0.84rem;
          }


          .member-incomplete {
            font-size:
              0.78rem;
          }


          .member-action-primary,
          .member-action-secondary {
            width:
              100%;
          }

        }

      `}</style>

    </>
  )
}