'use client'

import { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'

import './CitiesMarquee.css'

const SWITCH_INTERVAL =
  5 * 60 * 1000


function getTimestampValue(
  timestamp
) {
  if (!timestamp) {
    return 0
  }

  if (timestamp?.toDate) {
    return timestamp
      .toDate()
      .getTime()
  }

  const date =
    new Date(timestamp)

  return Number.isNaN(
    date.getTime()
  )
    ? 0
    : date.getTime()
}


function getTimeAgo(
  timestamp
) {
  const timestampValue =
    getTimestampValue(
      timestamp
    )

  if (!timestampValue) {
    return ''
  }

  const diff =
    Date.now() -
    timestampValue

  const minutes =
    Math.floor(
      diff / 60000
    )

  const hours =
    Math.floor(
      diff / 3600000
    )

  const days =
    Math.floor(
      diff / 86400000
    )

  if (minutes < 1) {
    return 'just now'
  }

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  if (hours < 24) {
    return `${hours}h ago`
  }

  if (days === 1) {
    return 'yesterday'
  }

  return `${days} days ago`
}


function normalizeConnectionPurpose(
  value = ''
) {
  const item =
    String(value)
      .trim()
      .toLowerCase()

  if (
    item === 'friend' ||
    item === 'friends' ||
    item === 'friendship' ||
    item === 'social' ||
    item === 'meet people'
  ) {
    return 'friendship'
  }

  if (
    item === 'date' ||
    item === 'dating'
  ) {
    return 'dating'
  }

  if (
    item === 'business' ||
    item === 'work' ||
    item === 'job' ||
    item === 'jobs' ||
    item === 'professional' ||
    item === 'networking'
  ) {
    return 'business'
  }

  return ''
}


export default function CitiesMarquee() {

  const cities = [
    '🗺 London',
    '🗺 New York',
    '🗺 Berlin',
    '🗺 Paris',
    '🗺 Singapore',
    '🗺 Lisbon',
    '🗺 Toronto',
    '🗺 Barcelona',
    '🗺 Amsterdam',
    '🗺 Tokyo',
    '🗺 Melbourne',
    '🗺 Dubai',
    '🗺 Chennai',
  ]


  const doubled = [
    ...cities,
    ...cities,
  ]


  const [
    currentUser,
    setCurrentUser,
  ] = useState(undefined)


  const [
    latestMember,
    setLatestMember,
  ] = useState(null)


  const [
    latestConnection,
    setLatestConnection,
  ] = useState(null)


  const [
    activityType,
    setActivityType,
  ] = useState('member')


  /* ─────────────────────────────────────────────
     AUTH
  ───────────────────────────────────────────── */

  useEffect(() => {
    const unsub =
      onAuthChange(
        (user) => {
          setCurrentUser(
            user || null
          )
        }
      )

    return () => unsub()

  }, [])


  /* ─────────────────────────────────────────────
     ACTIVITY
     
     /users and /connections remain PRIVATE.
     Anonymous visitors simply see the cities.
  ───────────────────────────────────────────── */

  useEffect(() => {

    if (
      currentUser ===
      undefined
    ) {
      return
    }


    if (!currentUser) {
      setLatestMember(null)
      setLatestConnection(null)

      return
    }


    async function loadActivity() {

      try {

        const [
          usersSnapshot,
          connectionsSnapshot,
        ] =
          await Promise.all([
            getDocs(
              collection(
                db,
                'users'
              )
            ),

            getDocs(
              collection(
                db,
                'connections'
              )
            ),
          ])


        const users =
          usersSnapshot.docs.map(
            (userDoc) => ({
              id:
                userDoc.id,

              ...userDoc.data(),
            })
          )


        const usersById =
          new Map(
            users.map(
              (user) => [
                user.id,
                user,
              ]
            )
          )


        /* NEW MEMBERS */

        const membersWithDate =
          users.filter(
            (user) =>
              getTimestampValue(
                user.created_at
              ) > 0
          )


        membersWithDate.sort(
          (a, b) =>
            getTimestampValue(
              b.created_at
            ) -
            getTimestampValue(
              a.created_at
            )
        )


        setLatestMember(
          membersWithDate[0] ||
          null
        )


        /* CONNECTIONS */

        const connected =
          connectionsSnapshot.docs
            .map(
              (connectionDoc) => ({
                id:
                  connectionDoc.id,

                ...connectionDoc.data(),
              })
            )
            .filter(
              (connection) =>
                connection.status ===
                'connected'
            )


        connected.sort(
          (a, b) => {

            const aTime =
              getTimestampValue(
                a.connected_at ||
                a.updated_at
              )

            const bTime =
              getTimestampValue(
                b.connected_at ||
                b.updated_at
              )

            return (
              bTime -
              aTime
            )
          }
        )


        const newestConnection =
          connected[0]


        if (
          !newestConnection
        ) {
          setLatestConnection(
            null
          )

          return
        }


        let purpose =
          normalizeConnectionPurpose(
            newestConnection.intention ||
            newestConnection.purpose ||
            newestConnection.category
          )


        /*
         * Legacy connections:
         * derive purpose from requester profile.
         */

        if (!purpose) {

          const requester =
            usersById.get(
              newestConnection.requestedBy
            )


          const requesterIntentions =
            Array.isArray(
              requester?.intentions
            )
              ? requester.intentions
              : []


          purpose =
            normalizeConnectionPurpose(
              requesterIntentions[0]
            )
        }


        setLatestConnection({
          ...newestConnection,

          purpose,

          activityDate:
            newestConnection.connected_at ||
            newestConnection.updated_at,
        })


      } catch (error) {

        console.error(
          'Error loading Ronda activity:',
          error
        )

      }
    }


    loadActivity()


    const refreshInterval =
      setInterval(
        loadActivity,
        SWITCH_INTERVAL
      )


    return () =>
      clearInterval(
        refreshInterval
      )

  }, [currentUser])


  /* ─────────────────────────────────────────────
     SWITCH MEMBER / CONNECTION
  ───────────────────────────────────────────── */

  useEffect(() => {

    if (!currentUser) {
      return
    }


    const switchInterval =
      setInterval(
        () => {

          setActivityType(
            (current) =>
              current === 'member'
                ? 'connection'
                : 'member'
          )

        },
        SWITCH_INTERVAL
      )


    return () =>
      clearInterval(
        switchInterval
      )

  }, [currentUser])


  /* ─────────────────────────────────────────────
     ACTIVITY VALUES
  ───────────────────────────────────────────── */

  const memberName =
    latestMember?.displayName ||
    latestMember?.name ||
    latestMember?.username ||
    'A new member'


  const canShowMember =
    Boolean(
      latestMember
    )


  const canShowConnection =
    Boolean(
      latestConnection
    )


  let visibleActivity =
    activityType


  if (
    visibleActivity ===
      'member' &&
    !canShowMember &&
    canShowConnection
  ) {
    visibleActivity =
      'connection'
  }


  if (
    visibleActivity ===
      'connection' &&
    !canShowConnection &&
    canShowMember
  ) {
    visibleActivity =
      'member'
  }


  /* ─────────────────────────────────────────────
     PAGE
  ───────────────────────────────────────────── */

  return (
    <section className="cities-marquee">

      <p className="marquee-label">
        Growing city by city
      </p>


      <div className="marquee-track">

        {doubled.map(
          (city, i) => (

            <span
              key={`${city}-${i}`}
              className="marquee-city"
            >
              {city}
            </span>

          )
        )}

      </div>


      {/* ACTIVITY ONLY FOR SIGNED-IN MEMBERS */}

      {currentUser &&
        visibleActivity ===
          'member' &&
        latestMember && (

          <div className="marquee-activity">

            <span className="activity-dot" />

            <span className="activity-name">
              {memberName}
            </span>

            <span className="activity-text">
              {' joined Ronda '}
            </span>

            <span className="activity-time">
              {getTimeAgo(
                latestMember.created_at
              )}
            </span>

          </div>
        )}


      {currentUser &&
        visibleActivity ===
          'connection' &&
        latestConnection && (

          <div className="marquee-activity">

            <span className="activity-dot" />

            <span className="activity-text">

              Two people connected

              {latestConnection.purpose
                ? ` for ${latestConnection.purpose}`
                : ''}

              {' '}

            </span>

            <span className="activity-time">

              {getTimeAgo(
                latestConnection.activityDate
              )}

            </span>

          </div>
        )}

    </section>
  )
}