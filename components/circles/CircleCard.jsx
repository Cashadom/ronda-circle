'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

import './CircleCard.css'

export default function CircleCard({ circle }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [connection, setConnection] = useState(null)
  const [loadingConnection, setLoadingConnection] = useState(true)
  const [processing, setProcessing] = useState(false)

  const targetUid =
    circle.id ||
    circle.uid ||
    ''

  const name =
    circle.name ||
    circle.displayName ||
    circle.username ||
    'Ronda member'

  const rawCity =
    circle.city ||
    ''

  const city =
    rawCity
      ? String(rawCity).trim().toUpperCase()
      : ''

  const gender =
    circle.gender ||
    ''

  const photo =
    circle.photoURL ||
    circle.photo_url ||
    '/point.png'

  const intentions =
    Array.isArray(circle.intentions)
      ? circle.intentions.filter(Boolean)
      : []

  const interests =
    Array.isArray(circle.interests)
      ? circle.interests.filter(Boolean)
      : []

  const formattedIntentions = intentions
    .slice(0, 5)
    .map((item) => String(item).toLowerCase())
    .join(' - ')

  const formattedInterests = interests
    .slice(0, 5)
    .map((item) => String(item).toLowerCase())
    .join(' · ')

  const genderClass =
    gender === 'female'
      ? 'card-title-female'
      : gender === 'male'
        ? 'card-title-male'
        : 'card-title-neutral'

  const connectionId = useMemo(() => {
    if (
      !currentUser?.uid ||
      !targetUid
    ) {
      return ''
    }

    return [
      currentUser.uid,
      targetUid,
    ]
      .sort()
      .join('_')
  }, [
    currentUser,
    targetUid,
  ])

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setCurrentUser(user || null)
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    async function loadConnection() {
      if (
        !currentUser?.uid ||
        !targetUid ||
        currentUser.uid === targetUid
      ) {
        setConnection(null)
        setLoadingConnection(false)
        return
      }

      setLoadingConnection(true)

      try {
        const connectionsQuery = query(
          collection(db, 'connections'),
          where(
            'participants',
            'array-contains',
            currentUser.uid
          )
        )

        const snapshot = await getDocs(
          connectionsQuery
        )

        const found =
          snapshot.docs
            .map((connectionDoc) => ({
              id: connectionDoc.id,
              ...connectionDoc.data(),
            }))
            .find((item) => {
              const participants =
                Array.isArray(
                  item.participants
                )
                  ? item.participants
                  : []

              return participants.includes(
                targetUid
              )
            })

        setConnection(
          found || null
        )
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
    targetUid,
  ])

  async function handleConnect() {
    if (
      !currentUser?.uid ||
      !targetUid ||
      currentUser.uid === targetUid ||
      !connectionId ||
      processing
    ) {
      return
    }

    setProcessing(true)

    try {
      const newConnection = {
        participants: [
          currentUser.uid,
          targetUid,
        ],

        requestedBy:
          currentUser.uid,

        status:
          'pending',

        created_at:
          serverTimestamp(),

        updated_at:
          serverTimestamp(),
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
          targetUid,
        ],

        requestedBy:
          currentUser.uid,

        status:
          'pending',
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

  async function handleAccept() {
    if (
      !currentUser?.uid ||
      !connection ||
      !connection.id ||
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
          connection.id
        ),
        {
          status:
            'connected',

          connected_at:
            serverTimestamp(),

          updated_at:
            serverTimestamp(),
        }
      )

      setConnection((current) => ({
        ...current,
        status:
          'connected',
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

  function renderConnectionAction() {
    if (!currentUser) {
      return (
        <Link
          href="/login"
          className="btn-join"
        >
          connect
        </Link>
      )
    }

    if (
      currentUser.uid === targetUid
    ) {
      return null
    }

    if (loadingConnection) {
      return (
        <span
          className="btn-join"
          style={{
            opacity: 0.55,
            pointerEvents: 'none',
          }}
        >
          ...
        </span>
      )
    }

    if (!connection) {
      return (
        <button
          type="button"
          className="btn-join"
          onClick={handleConnect}
          disabled={processing}
          style={{
            border: 'none',
            cursor:
              processing
                ? 'default'
                : 'pointer',
          }}
        >
          {processing
            ? '...'
            : 'connect'}
        </button>
      )
    }

    if (
      connection.status === 'pending' &&
      connection.requestedBy === currentUser.uid
    ) {
      return (
        <span
          className="btn-join"
          style={{
            background: '#F3EEEA',
            color: '#817A75',
            boxShadow: 'none',
            pointerEvents: 'none',
          }}
        >
          pending
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
          className="btn-join"
          onClick={handleAccept}
          disabled={processing}
          style={{
            border: 'none',
            cursor:
              processing
                ? 'default'
                : 'pointer',
          }}
        >
          {processing
            ? '...'
            : 'accept'}
        </button>
      )
    }

    if (
      connection.status === 'connected'
    ) {
      return (
        <Link
          href={`/messages/${connection.id}`}
          className="btn-join"
        >
          message
        </Link>
      )
    }

    return (
      <button
        type="button"
        className="btn-join"
        onClick={handleConnect}
        disabled={processing}
        style={{
          border: 'none',
          cursor:
            processing
              ? 'default'
              : 'pointer',
        }}
      >
        connect
      </button>
    )
  }

  return (
    <article className="circle-card">
      <div className="card-body">

        <div className="card-main-line">

          <div className="card-person">

            <img
              src={photo}
              alt={name}
              className="card-person-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  '/point.png'
              }}
            />

            <div className="card-text">

              <div className="card-primary-line">

                <span
                  className={`card-title ${genderClass}`}
                >
                  {name}
                </span>

                {gender && (
                  <span className="card-gender">
                    {gender === 'female'
                      ? ' ♀'
                      : gender === 'male'
                        ? ' ♂'
                        : ''}
                  </span>
                )}

                <span className="card-sentence">
                  {city
                    ? ` from ${city} has interest to meet people`
                    : ' has interest to meet people'}
                </span>

                {formattedIntentions && (
                  <>
                    <span className="card-sentence">
                      {' '}for{' '}
                    </span>

                    <span className="card-intentions-text">
                      {formattedIntentions}
                    </span>
                  </>
                )}

              </div>

              {formattedInterests && (
                <div className="card-interests">
                  {formattedInterests}
                </div>
              )}

            </div>

          </div>

          <div className="card-footer">
            {renderConnectionAction()}
          </div>

        </div>

      </div>
    </article>
  )
}