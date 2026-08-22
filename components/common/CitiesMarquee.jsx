'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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


  const [
    totalUsers,
    setTotalUsers,
  ] = useState(null)


  /* ─────────────────────────────────────────────
     PUBLIC TOTAL USERS

     Uses the public server API.
     No Firestore permission required.
  ───────────────────────────────────────────── */

  useEffect(() => {

    async function loadPublicStats() {

      try {

        const response =
          await fetch(
            '/api/stats',
            {
              method: 'GET',
              cache: 'no-store',
            }
          )


        if (!response.ok) {
          throw new Error(
            'Unable to load Ronda statistics'
          )
        }


        const data =
          await response.json()


        setTotalUsers(
          Number(
            data.total_users ||
            0
          )
        )


      } catch (error) {

        console.error(
          'Error loading Ronda statistics:',
          error
        )

      }
    }


    loadPublicStats()

  }, [])


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


    return () =>
      unsub()

  }, [])


  /* ─────────────────────────────────────────────
     LATEST ACTIVITY

     Keeps your previous logic:
     - latest member
     - latest accepted connection
     - alternating activity
  ───────────────────────────────────────────── */

  useEffect(() => {

    if (
      currentUser ===
      undefined
    ) {
      return
    }


    if (!currentUser) {

      setLatestMember(
        null
      )

      setLatestConnection(
        null
      )

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


        /* ─────────────────────────────────
           NEWEST MEMBER
        ───────────────────────────────── */


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


        /* ─────────────────────────────────
           NEWEST CONNECTION
        ───────────────────────────────── */


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
         * Legacy connection:
         * use requester intentions when
         * connection purpose is missing.
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
              current ===
              'member'
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


      {/* ─────────────────────────────────────
          COMMUNITY HEADER
      ───────────────────────────────────── */}

      <div className="ronda-community-line">

        <div className="ronda-community-count">

          <span className="ronda-community-prefix">
            Ronda has
          </span>

          <strong>
            {totalUsers !== null
              ? totalUsers.toLocaleString(
                  'en-US'
                )
              : '—'}
          </strong>

          <span className="ronda-community-prefix">
            members
          </span>

        </div>


        <Link
          href="/dashboard"
          className="ronda-community-link"
        >
          See statistics
          <span>→</span>
        </Link>

      </div>


      {/* ─────────────────────────────────────
          CITIES — ORIGINAL ICONS PRESERVED
      ───────────────────────────────────── */}

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


      {/* ─────────────────────────────────────
          ORIGINAL ACTIVITY — MEMBER
      ───────────────────────────────────── */}

      {currentUser &&
        visibleActivity ===
          'member' &&
        latestMember && (

          <div className="marquee-activity">

            <span
              className="activity-dot"
            />

            <span
              className="activity-name"
            >
              {memberName}
            </span>

            <span
              className="activity-text"
            >
              {' joined Ronda '}
            </span>

            <span
              className="activity-time"
            >
              {getTimeAgo(
                latestMember.created_at
              )}
            </span>

          </div>

        )}


      {/* ─────────────────────────────────────
          ORIGINAL ACTIVITY — CONNECTION
      ───────────────────────────────────── */}

      {currentUser &&
        visibleActivity ===
          'connection' &&
        latestConnection && (

          <div className="marquee-activity">

            <span
              className="activity-dot"
            />

            <span
              className="activity-text"
            >

              Two people connected

              {latestConnection.purpose
                ? ` for ${latestConnection.purpose}`
                : ''}

              {' '}

            </span>


            <span
              className="activity-time"
            >
              {getTimeAgo(
                latestConnection.activityDate
              )}
            </span>

          </div>

        )}


      {/* ─────────────────────────────────────
          SMALL ADDITIONAL LAYOUT ONLY
      ───────────────────────────────────── */}

      <style jsx global>{`

        .ronda-community-line {
          width:
            calc(100% - 40px);

          max-width:
            760px;

          margin:
            0 auto 20px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            18px;
        }


        .ronda-community-count {
          display:
            inline-flex;

          align-items:
            baseline;

          gap:
            6px;

          padding:
            8px 14px;

          border:
            1px solid
            #F0DED7;

          border-radius:
            999px;

          background:
            #FFFFFF;

          box-shadow:
            0 5px 16px
            rgba(
              78,
              57,
              49,
              0.04
            );
        }


        .ronda-community-count strong {
          color:
            #FF604E;

          font-size:
            0.95rem;

          font-weight:
            800;

          letter-spacing:
            -0.02em;
        }


        .ronda-community-prefix {
          color:
            #786D67;

          font-size:
            0.68rem;

          font-weight:
            650;
        }


        .ronda-community-link {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            7px;

          color:
            #FF604E;

          font-size:
            0.68rem;

          font-weight:
            750;

          text-decoration:
            none;

          white-space:
            nowrap;
        }


        .ronda-community-link:hover {
          text-decoration:
            underline;
        }


        .ronda-community-link span {
          font-size:
            0.85rem;
        }


        @media (
          max-width: 560px
        ) {

          .ronda-community-line {
            width:
              calc(100% - 24px);

            margin-bottom:
              16px;

            flex-direction:
              column;

            gap:
              8px;
          }


          .ronda-community-count {
            padding:
              7px 13px;
          }

        }

      `}</style>


    </section>
  )
}