'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
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

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

import {
  getCurrentUser,
  signInWithGoogle,
  onAuthChange,
} from '@/lib/auth'

import {
  getCircle,
  getCircleMembers,
  joinCircle,
  leaveCircle,
} from '@/lib/circleService'

import { getDisplayName } from '@/lib/users'
import { db } from '@/lib/firebase'


function normalizeType(value = '') {
  const item = String(value)
    .trim()
    .toLowerCase()

  if (
    item === 'friend' ||
    item === 'friends' ||
    item === 'friendship' ||
    item === 'social'
  ) {
    return 'Friends'
  }

  if (
    item === 'date' ||
    item === 'dating'
  ) {
    return 'Date'
  }

  if (
    item === 'business' ||
    item === 'work' ||
    item === 'job' ||
    item === 'jobs' ||
    item === 'networking'
  ) {
    return 'Business'
  }

  return 'Friends'
}


function buildCircleName(circle) {
  const city =
    String(circle?.city || '')
      .trim()
      .toUpperCase()

  const type =
    normalizeType(
      circle?.type ||
      circle?.category
    )

  if (city) {
    return `Ronda Club · ${city} · ${type}`
  }

  return (
    circle?.title ||
    'Ronda Club'
  )
}


function memberName(member) {
  return (
    member?.displayName ||
    member?.name ||
    member?.username ||
    'Ronda member'
  )
}


export default function CirclePageClient() {
  const { id } = useParams()

  const [circle, setCircle] = useState(null)
  const [circleLoading, setCircleLoading] = useState(true)

  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)

  const [creatorName, setCreatorName] = useState('Ronda member')

  const [currentUser, setCurrentUser] = useState(null)
  const [joined, setJoined] = useState(false)

  const [connections, setConnections] = useState([])

  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')

  const [error, setError] = useState('')


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
     LOAD CIRCLE
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!id) return

    setCircleLoading(true)

    getCircle(id)
      .then((data) => {
        setCircle(data || null)
      })
      .catch(() => {
        setCircle(null)
      })
      .finally(() => {
        setCircleLoading(false)
      })
  }, [id])


  /* ─────────────────────────────────────────────
     LOAD MEMBERS
  ───────────────────────────────────────────── */

  async function loadMembers() {
    if (!id) return

    setMembersLoading(true)

    try {
      const list =
        await getCircleMembers(id)

      setMembers(
        Array.isArray(list)
          ? list
          : []
      )
    } catch (err) {
      console.error(
        'Error loading Circle members:',
        err
      )

      setMembers([])
    } finally {
      setMembersLoading(false)
    }
  }


  useEffect(() => {
    loadMembers()
  }, [id])


  /* ─────────────────────────────────────────────
     CREATOR
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!circle?.created_by) {
      setCreatorName(
        circle?.created_by_name ||
        'Ronda member'
      )
      return
    }

    /*
     * Visitors who are not signed in
     * may not have permission to read /users.
     *
     * We therefore use the public creator name
     * stored directly on the Circle first.
     */

    if (!currentUser) {
      setCreatorName(
        circle?.created_by_name ||
        'Ronda member'
      )
      return
    }

    getDisplayName(
      circle.created_by
    )
      .then((name) => {
        setCreatorName(
          name ||
          circle?.created_by_name ||
          'Ronda member'
        )
      })
      .catch(() => {
        setCreatorName(
          circle?.created_by_name ||
          'Ronda member'
        )
      })

  }, [
    circle?.created_by,
    circle?.created_by_name,
    currentUser,
  ])


  /* ─────────────────────────────────────────────
     JOINED STATE
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (!currentUser?.uid) {
      setJoined(false)
      return
    }

    setJoined(
      members.some((member) => {
        const uid =
          member.uid ||
          member.id ||
          member.user_id

        return (
          uid ===
          currentUser.uid
        )
      })
    )
  }, [
    members,
    currentUser,
  ])


  /* ─────────────────────────────────────────────
     LOAD CONNECTIONS
  ───────────────────────────────────────────── */

  useEffect(() => {
    async function loadConnections() {
      if (!currentUser?.uid) {
        setConnections([])
        return
      }

      try {
        const connectionsQuery =
          query(
            collection(
              db,
              'connections'
            ),

            where(
              'participants',
              'array-contains',
              currentUser.uid
            )
          )

        const snapshot =
          await getDocs(
            connectionsQuery
          )

        const data =
          snapshot.docs.map(
            (connectionDoc) => ({
              id:
                connectionDoc.id,

              ...connectionDoc.data(),
            })
          )

        setConnections(data)

      } catch (err) {
        console.error(
          'Error loading connections:',
          err
        )

        setConnections([])
      }
    }

    loadConnections()
  }, [currentUser])


  /* ─────────────────────────────────────────────
     JOIN
  ───────────────────────────────────────────── */

  async function handleJoin() {
    setError('')

    try {
      let user =
        getCurrentUser()

      if (!user) {
        user =
          await signInWithGoogle()
      }

      await joinCircle(
        id,
        user
      )

      await loadMembers()

      setJoined(true)

    } catch (err) {
      setError(
        err?.message ||
        'Unable to join this Circle.'
      )
    }
  }


  /* ─────────────────────────────────────────────
     LEAVE
  ───────────────────────────────────────────── */

  async function handleLeave() {
    setError('')

    const confirmed =
      window.confirm(
        'Leave this Circle?'
      )

    if (!confirmed) return

    try {
      const user =
        getCurrentUser()

      if (!user) {
        await signInWithGoogle()
        return
      }

      await leaveCircle(
        id,
        user.uid
      )

      await loadMembers()

      setJoined(false)

    } catch (err) {
      setError(
        err?.message ||
        'Unable to leave this Circle.'
      )
    }
  }


  /* ─────────────────────────────────────────────
     FIND CONNECTION
  ───────────────────────────────────────────── */

  function getConnectionWith(targetUid) {
    return connections.find(
      (connection) => {
        const participants =
          Array.isArray(
            connection.participants
          )
            ? connection.participants
            : []

        return participants.includes(
          targetUid
        )
      }
    )
  }


  /* ─────────────────────────────────────────────
     CONNECT
  ───────────────────────────────────────────── */

  async function handleConnect(targetUid) {
    if (
      !currentUser?.uid ||
      !targetUid ||
      currentUser.uid === targetUid
    ) {
      return
    }

    const connectionId =
      [
        currentUser.uid,
        targetUid,
      ]
        .sort()
        .join('_')

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

      setConnections(
        (current) => [
          ...current.filter(
            (item) =>
              item.id !==
              connectionId
          ),

          {
            id:
              connectionId,

            participants: [
              currentUser.uid,
              targetUid,
            ],

            requestedBy:
              currentUser.uid,

            status:
              'pending',
          },
        ]
      )

    } catch (err) {
      console.error(
        'Error creating connection:',
        err
      )

      window.alert(
        'The connection request could not be sent.'
      )
    }
  }


  /* ─────────────────────────────────────────────
     ACCEPT
  ───────────────────────────────────────────── */

  async function handleAccept(connection) {
    if (!connection?.id) return

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

      setConnections(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              connection.id
                ? {
                    ...item,
                    status:
                      'connected',
                  }
                : item
          )
      )

    } catch (err) {
      console.error(
        'Error accepting connection:',
        err
      )

      window.alert(
        'The connection could not be accepted.'
      )
    }
  }


  /* ─────────────────────────────────────────────
     MEMBER ACTION
  ───────────────────────────────────────────── */

  function renderMemberAction(targetUid) {
    /*
     * Anonymous visitor:
     * members remain visible.
     * Connecting requires a profile.
     */

    if (!currentUser) {
      return (
        <Link
          href="/login"
          className="member-action primary"
        >
          Connect
        </Link>
      )
    }


    if (
      currentUser.uid ===
      targetUid
    ) {
      return (
        <span className="member-action own">
          You
        </span>
      )
    }


    const connection =
      getConnectionWith(
        targetUid
      )


    if (!connection) {
      return (
        <button
          type="button"
          className="member-action primary"
          onClick={() =>
            handleConnect(
              targetUid
            )
          }
        >
          Connect
        </button>
      )
    }


    if (
      connection.status ===
        'pending' &&
      connection.requestedBy ===
        currentUser.uid
    ) {
      return (
        <span className="member-action pending">
          Pending
        </span>
      )
    }


    if (
      connection.status ===
        'pending' &&
      connection.requestedBy !==
        currentUser.uid
    ) {
      return (
        <button
          type="button"
          className="member-action primary"
          onClick={() =>
            handleAccept(
              connection
            )
          }
        >
          Accept
        </button>
      )
    }


    if (
      connection.status ===
      'connected'
    ) {
      return (
        <Link
          href={`/messages/${connection.id}`}
          className="member-action primary"
        >
          Message
        </Link>
      )
    }


    return null
  }


  /* ─────────────────────────────────────────────
     FILTER MEMBERS
  ───────────────────────────────────────────── */

  const filteredMembers =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase()

      return members.filter(
        (member) => {
          const name =
            memberName(member)
              .toLowerCase()

          const city =
            String(
              member.city ||
              ''
            )
              .trim()
              .toLowerCase()

          const gender =
            String(
              member.gender ||
              ''
            )
              .trim()
              .toLowerCase()

          const matchesSearch =
            !cleanSearch ||
            name.includes(
              cleanSearch
            ) ||
            city.includes(
              cleanSearch
            )

          const matchesGender =
            genderFilter ===
            'all'
              ? true
              : gender ===
                genderFilter

          return (
            matchesSearch &&
            matchesGender
          )
        }
      )
    }, [
      members,
      search,
      genderFilter,
    ])


  /* ─────────────────────────────────────────────
     LOADING
  ───────────────────────────────────────────── */

  if (circleLoading) {
    return (
      <>
        <Navbar />

        <main className="circle-loading">
          Loading Circle...
        </main>

        <Footer />
      </>
    )
  }


  /* ─────────────────────────────────────────────
     NOT FOUND
  ───────────────────────────────────────────── */

  if (!circle) {
    return (
      <>
        <Navbar />

        <main className="circle-loading">

          <div>

            <p>
              Circle not found.
            </p>

            <Link href="/circles">
              Back to Circles
            </Link>

          </div>

        </main>

        <Footer />
      </>
    )
  }


  const circleType =
    normalizeType(
      circle.type ||
      circle.category
    )

  const circleName =
    buildCircleName(
      circle
    )

  const description =
    String(
      circle.description ||
      ''
    ).trim()


  /* ─────────────────────────────────────────────
     PAGE
  ───────────────────────────────────────────── */

  return (
    <>
      <Navbar />

      <main className="circle-page">

        <div className="circle-container">


          {/* BACK */}

          <Link
            href="/circles"
            className="back-link"
          >
            ← Back to Circles
          </Link>


          {/* HEADER */}

          <section className="circle-header">

            <div className="circle-header-content">

              <div className="circle-header-top">

                <span
                  className={`circle-type circle-type-${circleType.toLowerCase()}`}
                >
                  {circleType}
                </span>

                <span className="circle-member-count">
                  {members.length}{' '}
                  {members.length === 1
                    ? 'member'
                    : 'members'}
                </span>

              </div>


              <h1>
                {circleName}
              </h1>


              <p className="created-by">
                Created by{' '}
                <strong>
                  {creatorName}
                </strong>
              </p>


              {description && (
                <p className="circle-description">
                  {description}
                </p>
              )}


              <p className="circle-purpose">
                Discover people in this Circle,
                connect privately and start
                a conversation if they accept.
              </p>

            </div>


            <div className="circle-join-area">

              {!joined ? (
                <button
                  type="button"
                  className="join-circle"
                  onClick={
                    handleJoin
                  }
                >
                  Join Circle
                </button>
              ) : (
                <>
                  <span className="joined-badge">
                    Joined
                  </span>

                  <button
                    type="button"
                    className="leave-circle"
                    onClick={
                      handleLeave
                    }
                  >
                    Leave
                  </button>
                </>
              )}

            </div>

          </section>


          {error && (
            <p className="circle-error">
              {error}
            </p>
          )}


          {/* MEMBERS */}

          <section className="members-section">

            <div className="members-heading">

              <div>

                <p className="members-eyebrow">
                  People in this Circle
                </p>

                <h2>
                  Discover members
                </h2>

              </div>

            </div>


            {/* VISITOR MESSAGE */}

            {!currentUser && (
              <div className="circle-login-hint">

                <strong>
                  See someone you&apos;d like to know?
                </strong>

                <span>
                  Create your free Ronda profile to connect with people in this Circle.
                </span>

                <Link
                  href="/login"
                  className="circle-login-link"
                >
                  Create profile
                </Link>

              </div>
            )}


            {/* FILTERS */}

            {members.length > 0 && (
              <div className="members-filters">

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search people..."
                  className="member-search"
                />


                <select
                  value={
                    genderFilter
                  }
                  onChange={(event) =>
                    setGenderFilter(
                      event.target.value
                    )
                  }
                  className="member-filter"
                >

                  <option value="all">
                    All genders
                  </option>

                  <option value="female">
                    Women
                  </option>

                  <option value="male">
                    Men
                  </option>

                </select>

              </div>
            )}


            {/* MEMBER LIST */}

            {membersLoading ? (

              <p className="members-loading">
                Loading members...
              </p>

            ) : filteredMembers.length ===
              0 ? (

              <div className="members-empty">
                No members match your search.
              </div>

            ) : (

              <div className="members-list">

                {filteredMembers.map(
                  (member) => {

                    const uid =
                      member.uid ||
                      member.id ||
                      member.user_id ||
                      ''

                    const name =
                      memberName(
                        member
                      )

                    const photo =
                      member.photoURL ||
                      member.photo_url ||
                      '/point.png'

                    const city =
                      String(
                        member.city ||
                        ''
                      )
                        .trim()
                        .toUpperCase()

                    const gender =
                      member.gender ||
                      ''

                    const intentions =
                      Array.isArray(
                        member.intentions
                      )
                        ? member.intentions
                        : []

                    const intention =
                      intentions[0] ||
                      circleType


                    return (
                      <article
                        key={
                          uid ||
                          name
                        }
                        className="member-row"
                      >


                        {/* PROFILE DATA */}

                        {currentUser && uid ? (

                          <Link
                            href={`/members/${uid}`}
                            className="member-profile"
                          >

                            <img
                              src={photo}
                              alt={name}
                              className="member-avatar"
                              onError={(event) => {
                                event.currentTarget.src =
                                  '/point.png'
                              }}
                            />


                            <div className="member-info">

                              <div className="member-name-line">

                                <strong>
                                  {name}
                                </strong>


                                {gender ===
                                  'female' && (
                                  <span className="gender-symbol">
                                    ♀
                                  </span>
                                )}


                                {gender ===
                                  'male' && (
                                  <span className="gender-symbol">
                                    ♂
                                  </span>
                                )}

                              </div>


                              <div className="member-meta">

                                {city && (
                                  <span>
                                    {city}
                                  </span>
                                )}


                                {city &&
                                  intention && (
                                    <span>
                                      ·
                                    </span>
                                  )}


                                {intention && (
                                  <span className="member-intention">
                                    {String(
                                      intention
                                    )}
                                  </span>
                                )}

                              </div>

                            </div>

                          </Link>

                        ) : (

                          /*
                           * Anonymous visitor:
                           * member is visible but profile page
                           * remains protected.
                           */

                          <div className="member-profile">

                            <img
                              src={photo}
                              alt={name}
                              className="member-avatar"
                              onError={(event) => {
                                event.currentTarget.src =
                                  '/point.png'
                              }}
                            />


                            <div className="member-info">

                              <div className="member-name-line">

                                <strong>
                                  {name}
                                </strong>


                                {gender ===
                                  'female' && (
                                  <span className="gender-symbol">
                                    ♀
                                  </span>
                                )}


                                {gender ===
                                  'male' && (
                                  <span className="gender-symbol">
                                    ♂
                                  </span>
                                )}

                              </div>


                              <div className="member-meta">

                                {city && (
                                  <span>
                                    {city}
                                  </span>
                                )}


                                {city &&
                                  intention && (
                                    <span>
                                      ·
                                    </span>
                                  )}


                                {intention && (
                                  <span className="member-intention">
                                    {String(
                                      intention
                                    )}
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>

                        )}


                        {/* ACTION */}

                        <div className="member-actions">

                          {uid &&
                            renderMemberAction(
                              uid
                            )}

                        </div>

                      </article>
                    )
                  }
                )}

              </div>

            )}

          </section>


          {/* BOTTOM */}

          <div className="circle-bottom">

            <Link href="/circles">
              Discover other Circles
            </Link>

            <Link href="/members">
              Discover people
            </Link>

          </div>

        </div>

      </main>

      <Footer />


      <style jsx global>{`

        .circle-page {
          min-height: 100vh;
          background: #FFF8F2;
          padding: 145px 20px 70px;
          box-sizing: border-box;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          color: #2B2725;
        }


        .circle-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
        }


        .circle-loading {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          background: #FFF8F2;

          padding: 120px 20px 40px;

          box-sizing: border-box;

          text-align: center;

          color: #817A75;
        }


        .circle-loading a {
          color: #FF6B5A;
          text-decoration: none;
        }


        /* BACK */

        .back-link {
          display: inline-flex;

          margin-bottom: 18px;

          color: #817A75;

          font-size: 0.78rem;

          text-decoration: none;
        }


        .back-link:hover {
          color: #FF6B5A;
        }


        /* HEADER */

        .circle-header {
          display: flex;

          align-items: flex-start;
          justify-content: space-between;

          gap: 30px;

          padding: 28px;

          border: 1px solid #E9DDD4;

          border-radius: 20px;

          background: #FFFFFF;

          margin-bottom: 18px;
        }


        .circle-header-content {
          flex: 1;
          min-width: 0;
        }


        .circle-header-top {
          display: flex;
          align-items: center;

          gap: 10px;

          margin-bottom: 12px;
        }


        .circle-type {
          display: inline-flex;

          padding: 5px 11px;

          border-radius: 999px;

          background: #FFF0EB;

          color: #FF604E;

          font-size: 0.7rem;

          font-weight: 700;
        }


        .circle-type-date {
          background: #FFF0F6;
          color: #D94D87;
        }


        .circle-type-business {
          background: #EDF5FF;
          color: #397DC1;
        }


        .circle-member-count {
          color: #9A918B;
          font-size: 0.75rem;
        }


        .circle-header h1 {
          margin: 0 0 8px;

          font-size:
            clamp(
              1.5rem,
              4vw,
              2rem
            );

          line-height: 1.15;

          letter-spacing: -0.035em;
        }


        .created-by {
          margin: 0 0 16px;

          font-size: 0.76rem;

          color: #9A918B;
        }


        .created-by strong {
          color: #706965;
        }


        .circle-description {
          max-width: 620px;

          margin: 0 0 12px;

          font-size: 0.9rem;

          line-height: 1.6;

          color: #5F5A56;
        }


        .circle-purpose {
          max-width: 620px;

          margin: 0;

          font-size: 0.77rem;

          line-height: 1.5;

          color: #9A918B;
        }


        /* JOIN */

        .circle-join-area {
          display: flex;

          align-items: center;

          gap: 8px;

          flex-shrink: 0;
        }


        .join-circle {
          padding: 9px 20px;

          border: none;

          border-radius: 999px;

          background: #FF6B5A;

          color: #FFFFFF;

          font-family: inherit;

          font-size: 0.8rem;

          font-weight: 650;

          cursor: pointer;
        }


        .join-circle:hover {
          background: #F45542;
        }


        .joined-badge {
          padding: 7px 14px;

          border-radius: 999px;

          background: #EAF7F0;

          color: #458467;

          font-size: 0.75rem;

          font-weight: 650;
        }


        .leave-circle {
          border: 1px solid #E9DDD4;

          border-radius: 999px;

          background: transparent;

          color: #9A918B;

          padding: 7px 13px;

          font-family: inherit;

          font-size: 0.72rem;

          cursor: pointer;
        }


        .leave-circle:hover {
          color: #D85B50;

          border-color: #E7B7B1;
        }


        .circle-error {
          margin: 0 0 16px;

          color: #C94E45;

          font-size: 0.8rem;
        }


        /* MEMBERS */

        .members-section {
          padding: 28px;

          border: 1px solid #E9DDD4;

          border-radius: 20px;

          background: #FFFFFF;
        }


        .members-heading {
          margin-bottom: 18px;
        }


        .members-eyebrow {
          margin: 0 0 4px;

          color: #FF6B5A;

          font-size: 0.68rem;

          font-weight: 700;

          letter-spacing: 0.1em;

          text-transform: uppercase;
        }


        .members-heading h2 {
          margin: 0;

          font-size: 1.2rem;

          letter-spacing: -0.02em;
        }


        /* VISITOR CTA */

        .circle-login-hint {
          display: flex;

          align-items: center;

          gap: 5px;

          flex-wrap: wrap;

          margin: -3px 0 18px;

          padding: 11px 14px;

          border: 1px solid #F3D8D1;

          border-radius: 12px;

          background: #FFF7F4;

          color: #817A75;

          font-size: 0.76rem;

          line-height: 1.5;
        }


        .circle-login-hint strong {
          color: #FF604E;

          font-weight: 700;
        }


        .circle-login-hint span {
          flex: 1;

          min-width: 220px;
        }


        .circle-login-link {
          flex-shrink: 0;

          color: #FF604E;

          font-weight: 700;

          text-decoration: none;
        }


        .circle-login-link:hover {
          color: #F45542;
        }


        /* FILTERS */

        .members-filters {
          display: flex;

          gap: 10px;

          margin-bottom: 18px;
        }


        .member-search {
          flex: 1;

          height: 42px;

          padding: 0 15px;

          box-sizing: border-box;

          border: 1px solid #E5E1DD;

          border-radius: 999px;

          outline: none;

          font-family: inherit;

          font-size: 0.8rem;
        }


        .member-search:focus {
          border-color: #FFB8AD;
        }


        .member-filter {
          height: 42px;

          min-width: 140px;

          padding: 0 15px;

          border: 1px solid #E5E1DD;

          border-radius: 999px;

          background: #FFFFFF;

          font-family: inherit;

          color: #5F5A56;
        }


        /* MEMBER LIST */

        .members-list {
          display: flex;

          flex-direction: column;

          gap: 7px;
        }


        .member-row {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 16px;

          padding: 10px 12px;

          border-radius: 11px;

          background: #F7FAFC;
        }


        .member-row:nth-child(even) {
          background: #FCFDFD;
        }


        .member-profile {
          flex: 1;

          min-width: 0;

          display: flex;

          align-items: center;

          gap: 11px;

          color: inherit;

          text-decoration: none;
        }


        .member-avatar {
          width: 42px;

          height: 42px;

          flex: 0 0 42px;

          border-radius: 50%;

          object-fit: cover;

          background: #FFFFFF;
        }


        .member-info {
          min-width: 0;
        }


        .member-name-line {
          display: flex;

          align-items: center;

          gap: 4px;

          margin-bottom: 2px;
        }


        .member-name-line strong {
          font-size: 0.85rem;

          color: #343434;
        }


        .gender-symbol {
          color: #9A918B;

          font-size: 0.75rem;
        }


        .member-meta {
          display: flex;

          align-items: center;

          gap: 5px;

          font-size: 0.72rem;

          color: #817A75;
        }


        .member-intention {
          color: #FF604E;

          font-weight: 600;
        }


        .member-actions {
          flex-shrink: 0;
        }


        .member-action {
          min-width: 88px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          padding: 7px 14px;

          border-radius: 999px;

          box-sizing: border-box;

          font-family: inherit;

          font-size: 0.72rem;

          font-weight: 650;

          text-decoration: none;
        }


        .member-action.primary {
          border: none;

          background: #FF6B5A;

          color: #FFFFFF;

          cursor: pointer;
        }


        .member-action.primary:hover {
          background: #F45542;
        }


        .member-action.pending,
        .member-action.own {
          background: #F3EEEA;

          color: #817A75;
        }


        .members-loading,
        .members-empty {
          padding: 35px 0;

          text-align: center;

          color: #9A918B;

          font-size: 0.82rem;
        }


        /* BOTTOM */

        .circle-bottom {
          display: flex;

          justify-content: center;

          gap: 24px;

          padding: 24px 0 0;
        }


        .circle-bottom a {
          color: #FF6B5A;

          text-decoration: none;

          font-size: 0.78rem;
        }


        /* MOBILE */

        @media (max-width: 640px) {

          .circle-page {
            padding:
              130px 12px 45px;
          }


          .circle-header {
            flex-direction: column;

            padding: 20px;
          }


          .circle-join-area {
            width: 100%;
          }


          .join-circle {
            width: 100%;
          }


          .members-section {
            padding: 18px 14px;
          }


          .circle-login-hint {
            align-items: flex-start;

            flex-direction: column;

            gap: 3px;

            padding: 11px 12px;
          }


          .circle-login-hint span {
            min-width: 0;
          }


          .circle-login-link {
            margin-top: 3px;
          }


          .members-filters {
            display: grid;

            grid-template-columns: 1fr;

            gap: 8px;
          }


          .member-filter {
            width: 100%;
          }


          .member-row {
            gap: 9px;

            padding: 9px;
          }


          .member-avatar {
            width: 36px;

            height: 36px;

            flex-basis: 36px;
          }


          .member-name-line strong {
            font-size: 0.8rem;
          }


          .member-meta {
            font-size: 0.66rem;
          }


          .member-action {
            min-width: 72px;

            padding: 6px 10px;

            font-size: 0.67rem;
          }


          .circle-bottom {
            gap: 14px;

            flex-wrap: wrap;
          }

        }

      `}</style>

    </>
  )
}