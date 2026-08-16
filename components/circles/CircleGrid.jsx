'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CircleCard from './CircleCard'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { onAuthChange } from '@/lib/auth'
import './CircleGrid.css'

const USERS_PER_PAGE = 100

function normalizeIntentions(values = []) {
  const result = new Set()

  values.forEach((value) => {
    const item = String(value || '')
      .trim()
      .toLowerCase()

    if (!item) return

    if (
      item === 'friend' ||
      item === 'friends' ||
      item === 'friendship' ||
      item === 'social' ||
      item === 'meet people'
    ) {
      result.add('friends')
    }

    if (
      item === 'date' ||
      item === 'dating'
    ) {
      result.add('date')
    }

    if (
      item === 'work' ||
      item === 'business' ||
      item === 'job' ||
      item === 'jobs' ||
      item === 'professional' ||
      item === 'networking'
    ) {
      result.add('business')
    }
  })

  return Array.from(result)
}

export default function CircleGrid() {
  const [currentUser, setCurrentUser] = useState(undefined)

  const [users, setUsers] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('all')
  const [intentionFilter, setIntentionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)


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
     USERS
     Only signed-in members may read /users.
  ───────────────────────────────────────────── */

  useEffect(() => {
    if (currentUser === undefined) {
      return
    }

    /*
     * Anonymous visitors must NOT attempt
     * to read the private /users collection.
     */
    if (!currentUser) {
      setUsers([])
      setError(false)
      setLoaded(true)
      return
    }

    async function fetchUsers() {
      setLoaded(false)
      setError(false)

      try {
        const snapshot = await getDocs(
          collection(db, 'users')
        )

        const data = snapshot.docs.map((doc) => {
          const user = doc.data()

          const realPhoto =
            user.photoURL ||
            user.photo_url ||
            ''

          const intentions =
            normalizeIntentions(
              Array.isArray(user.intentions)
                ? user.intentions
                : []
            )

          return {
            id: doc.id,

            uid:
              user.uid ||
              doc.id,

            name:
              user.displayName ||
              user.name ||
              user.username ||
              'Ronda member',

            photo_url:
              realPhoto ||
              '/point.png',

            photoURL:
              realPhoto ||
              '/point.png',

            hasRealPhoto:
              Boolean(realPhoto),

            city:
              user.city ||
              '',

            gender:
              user.gender ||
              '',

            intentions,
          }
        })

        const sortedUsers =
          [...data].sort((a, b) => {
            if (
              a.hasRealPhoto &&
              !b.hasRealPhoto
            ) {
              return -1
            }

            if (
              !a.hasRealPhoto &&
              b.hasRealPhoto
            ) {
              return 1
            }

            return a.name.localeCompare(
              b.name
            )
          })

        setUsers(sortedUsers)

      } catch (err) {
        console.error(
          'Error loading users:',
          err
        )

        setError(true)
        setUsers([])

      } finally {
        setLoaded(true)
      }
    }

    fetchUsers()

  }, [currentUser])


  /* ─────────────────────────────────────────────
     RESET PAGE
  ───────────────────────────────────────────── */

  useEffect(() => {
    setCurrentPage(1)
  }, [
    search,
    genderFilter,
    intentionFilter,
  ])


  /* ─────────────────────────────────────────────
     FILTER
  ───────────────────────────────────────────── */

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      return users.filter((user) => {
        const gender =
          String(user.gender || '')
            .trim()
            .toLowerCase()

        const matchesGender =
          genderFilter === 'all'
            ? true
            : genderFilter === 'unspecified'
              ? gender !== 'male' &&
                gender !== 'female'
              : gender === genderFilter

        const matchesIntention =
          intentionFilter === 'all'
            ? true
            : user.intentions.includes(
                intentionFilter
              )

        const searchableText = [
          user.name,
          user.city,
          ...user.intentions,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(
            normalizedSearch
          )

        return (
          matchesGender &&
          matchesIntention &&
          matchesSearch
        )
      })

    }, [
      users,
      search,
      genderFilter,
      intentionFilter,
    ])


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredUsers.length /
        USERS_PER_PAGE
      )
    )


  const startIndex =
    (currentPage - 1) *
    USERS_PER_PAGE


  const shownUsers =
    filteredUsers.slice(
      startIndex,
      startIndex +
        USERS_PER_PAGE
    )


  const noResults =
    loaded &&
    currentUser &&
    users.length > 0 &&
    filteredUsers.length === 0


  /* ─────────────────────────────────────────────
     PAGE
  ───────────────────────────────────────────── */

  return (
    <section className="circle-grid-section">


      {/* ANONYMOUS VISITOR */}

      {loaded && !currentUser && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 18px 36px',
          }}
        >
          <p
            style={{
              color: '#706965',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              margin: '0 0 14px',
            }}
          >
            Discover people inside Ronda Circles.
            Create a free profile to access the full people directory and connect.
          </p>

          <Link
            href="/circles"
            className="btn-primary"
          >
            Discover Circles
          </Link>
        </div>
      )}


      {/* FILTERS */}

      {loaded &&
        currentUser &&
        !error &&
        users.length > 0 && (

          <div className="people-filters">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search name, city..."
              className="people-search"
            />


            <select
              value={genderFilter}
              onChange={(event) =>
                setGenderFilter(
                  event.target.value
                )
              }
              className="people-filter-select"
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

              <option value="unspecified">
                Not specified
              </option>

            </select>


            <select
              value={intentionFilter}
              onChange={(event) =>
                setIntentionFilter(
                  event.target.value
                )
              }
              className="people-filter-select"
            >

              <option value="all">
                All
              </option>

              <option value="friends">
                Friends
              </option>

              <option value="date">
                Date
              </option>

              <option value="business">
                Business
              </option>

            </select>

          </div>
        )}


      {/* LOADING */}

      {!loaded && (
        <p
          style={{
            textAlign: 'center',
            color: '#706965',
            padding: '40px 0',
          }}
        >
          Loading people...
        </p>
      )}


      {/* NO MEMBER */}

      {loaded &&
        currentUser &&
        users.length === 0 &&
        !error && (

          <p
            style={{
              textAlign: 'center',
              color: '#706965',
              padding: '40px 0',
            }}
          >
            No members yet.
          </p>
        )}


      {/* NO RESULTS */}

      {noResults && !error && (
        <p
          style={{
            textAlign: 'center',
            color: '#706965',
            padding: '40px 0',
          }}
        >
          No people match your search.
        </p>
      )}


      {/* ERROR */}

      {error && (
        <p
          style={{
            textAlign: 'center',
            color: '#706965',
            padding: '40px 0',
          }}
        >
          Could not load members.
          Please try again later.
        </p>
      )}


      {/* USERS */}

      {currentUser &&
        !error &&
        shownUsers.length > 0 && (

          <div className="circle-grid">

            {shownUsers.map((user) => (

              <CircleCard
                key={
                  user.id ||
                  user.uid
                }
                circle={user}
              />

            ))}

          </div>
        )}


      {/* PAGINATION */}

      {currentUser &&
        filteredUsers.length > 0 && (

          <div className="people-pagination">

            {currentPage > 1 && (

              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page - 1
                  )
                }
              >
                Previous
              </button>
            )}


            <span className="pagination-info">

              {filteredUsers.length}
              {' people'}

              {totalPages > 1
                ? ` · Page ${currentPage} of ${totalPages}`
                : ''}

            </span>


            {currentPage < totalPages && (

              <button
                type="button"
                className="pagination-button"
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      page + 1
                  )
                }
              >
                Next
              </button>
            )}

          </div>
        )}


      {/* ACTION */}

      {currentUser && (
        <div className="circle-grid-actions">

          <Link
            href="/members"
            className="btn-primary"
          >
            Discover people
          </Link>

        </div>
      )}

    </section>
  )
}