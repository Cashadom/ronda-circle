'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

import { listOpenCircles } from '@/lib/circleService'
import { getDisplayName } from '@/lib/users'
import { onAuthChange } from '@/lib/auth'
import { db } from '@/lib/firebase'

const REQUIRED_CONNECTIONS = 20


/* ==========================================================================
   TYPE
============================================================================ */

function normalizeType(value = '') {
  const item = String(value || '')
    .trim()
    .toLowerCase()

  if (
    item === 'friend' ||
    item === 'friends' ||
    item === 'friendship' ||
    item === 'social' ||
    item === 'meet people'
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
    item === 'professional' ||
    item === 'networking'
  ) {
    return 'Business'
  }

  /*
   * Nouveau fallback Ronda.
   * On ne met plus Date par défaut.
   */
  return 'Friends'
}


/* ==========================================================================
   CITY
============================================================================ */

function cleanCity(value = '') {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
}


/*
 * Certains anciens Circles n'ont pas de champ city
 * mais possèdent une ville dans leur ancien titre :
 *
 * "Newcomers in Berlin – Saturday Social Drinks"
 *
 * On essaie de la récupérer uniquement pour l'affichage.
 * Aucun ID / aucune URL Firestore n'est modifié.
 */

function inferCityFromLegacyTitle(title = '') {
  const text = String(title || '').trim()

  if (!text) return ''

  const inCityMatch = text.match(
    /\bin\s+([A-Za-zÀ-ÿ'’.\-\s]+?)(?:\s*[–—|-]\s*|$)/i
  )

  if (inCityMatch?.[1]) {
    return cleanCity(inCityMatch[1])
  }

  return ''
}


function getCircleCity(circle) {
  const storedCity =
    cleanCity(circle?.city)

  if (storedCity) {
    return storedCity
  }

  return inferCityFromLegacyTitle(
    circle?.title
  )
}


/* ==========================================================================
   DISPLAY NAME
============================================================================ */

/*
 * Type déjà affiché dans le badge.
 *
 * Donc :
 *
 * Friends
 * Ronda Club · BERLIN
 *
 * et PAS :
 *
 * Friends
 * Ronda Club · BERLIN · Friends
 */

function buildCircleName(circle) {
  const city =
    getCircleCity(circle)

  if (city) {
    return `Ronda Club · ${city.toUpperCase()}`
  }

  /*
   * Pour un vieux Circle sans ville exploitable,
   * on ne remet pas son ancien titre événementiel.
   */
  return 'Ronda Club'
}


/* ==========================================================================
   PAGE
============================================================================ */

export default function CirclesPage() {
  const [circles, setCircles] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [currentUser, setCurrentUser] =
    useState(null)

  const [
    connectionCount,
    setConnectionCount,
  ] = useState(0)

  const [
    creatorNames,
    setCreatorNames,
  ] = useState({})

  const [search, setSearch] =
    useState('')

  const [typeFilter, setTypeFilter] =
    useState('all')


  /* ==========================================================================
     AUTH
  ========================================================================== */

  useEffect(() => {
    const unsub =
      onAuthChange((user) => {
        setCurrentUser(
          user || null
        )
      })

    return () => unsub()
  }, [])


  /* ==========================================================================
     LOAD CIRCLES
  ========================================================================== */

  useEffect(() => {
    async function loadCircles() {
      setLoading(true)

      try {
        const data =
          await listOpenCircles(100)

        const list =
          Array.isArray(data)
            ? data
            : []

        setCircles(list)


        /*
         * Creator names
         */

        const creatorIds = [
          ...new Set(
            list
              .map(
                (circle) =>
                  circle.created_by
              )
              .filter(Boolean)
          ),
        ]

        const names = {}

        await Promise.all(
          creatorIds.map(
            async (creatorId) => {
              try {
                names[creatorId] =
                  await getDisplayName(
                    creatorId
                  )
              } catch {
                names[creatorId] =
                  'Ronda member'
              }
            }
          )
        )

        setCreatorNames(
          names
        )

      } catch (err) {
        console.error(
          'Error loading circles:',
          err
        )

        setCircles([])
      } finally {
        setLoading(false)
      }
    }

    loadCircles()
  }, [])


  /* ==========================================================================
     CONNECTION COUNT
  ========================================================================== */

  useEffect(() => {
    async function loadConnections() {
      if (!currentUser?.uid) {
        setConnectionCount(0)
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

        const connected =
          snapshot.docs.filter(
            (connectionDoc) =>
              connectionDoc.data()
                ?.status ===
              'connected'
          )

        setConnectionCount(
          connected.length
        )

      } catch (err) {
        console.error(
          'Error loading connections:',
          err
        )

        setConnectionCount(0)
      }
    }

    loadConnections()
  }, [currentUser])


  /* ==========================================================================
     FILTERS
  ========================================================================== */

  const filteredCircles =
    useMemo(() => {
      const cleanSearch =
        search
          .trim()
          .toLowerCase()

      return circles.filter(
        (circle) => {
          const type =
            normalizeType(
              circle.type ||
              circle.category
            )

          const city =
            getCircleCity(
              circle
            )

          const matchesType =
            typeFilter === 'all'
              ? true
              : type
                  .toLowerCase() ===
                typeFilter

          const searchableText =
            [
              city,
              circle.title,
              circle.description,
              type,
              creatorNames[
                circle.created_by
              ],
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()

          const matchesSearch =
            !cleanSearch ||
            searchableText.includes(
              cleanSearch
            )

          return (
            matchesType &&
            matchesSearch
          )
        }
      )
    }, [
      circles,
      search,
      typeFilter,
      creatorNames,
    ])


  const canCreate =
    connectionCount >=
    REQUIRED_CONNECTIONS


  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="circles-page">
          <div className="circles-container">

            <p className="circles-loading">
              Loading Circles...
            </p>

          </div>
        </main>

        <Footer />
      </>
    )
  }


  /* ==========================================================================
     PAGE
  ========================================================================== */

  return (
    <>
      <Navbar />

      <main className="circles-page">

        <div className="circles-container">


          {/* ==================================================================
              HERO
          ================================================================== */}

          <section className="circles-hero">

            <div className="circles-hero-copy">

              <p className="circles-eyebrow">
                Ronda Circles
              </p>

              <h1>
                Find people with
                something in common.
              </h1>

              <p className="circles-intro">
                Join a Circle to discover
                people in your city interested
                in friendship, dating or business.
              </p>

              <p className="circles-explanation">
                No group chat. No events.
                Discover people, connect privately
                and talk.
              </p>

            </div>


            {currentUser && canCreate && (
              <Link
                href="/create-circle"
                className="create-circle-button"
              >
                Create a Circle
              </Link>
            )}

          </section>


          {/* ==================================================================
              CREATION UNLOCK
          ================================================================== */}

          {currentUser && !canCreate && (
            <div className="create-unlock">

              <div className="create-unlock-copy">

                <strong>
                  Create your own Circle
                </strong>

                <span>
                  Available after
                  20 connections.
                </span>

              </div>


              <div className="unlock-right">

                <span className="unlock-count">
                  {connectionCount}
                  {' / '}
                  {REQUIRED_CONNECTIONS}
                </span>

                <div className="unlock-progress">

                  <div
                    className="unlock-progress-fill"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          (
                            connectionCount /
                            REQUIRED_CONNECTIONS
                          ) * 100
                        )}%`,
                    }}
                  />

                </div>

              </div>

            </div>
          )}


          {/* ==================================================================
              FILTERS
          ================================================================== */}

          {circles.length > 0 && (
            <div className="circle-filters">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search city or Circle..."
                className="circle-search"
              />


              <div className="circle-type-filters">

                {[
                  ['all', 'All'],
                  ['friends', 'Friends'],
                  ['date', 'Date'],
                  ['business', 'Business'],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setTypeFilter(
                          value
                        )
                      }
                      className={
                        typeFilter ===
                        value
                          ? 'circle-filter active'
                          : 'circle-filter'
                      }
                    >
                      {label}
                    </button>
                  )
                )}

              </div>

            </div>
          )}


          {/* ==================================================================
              EMPTY
          ================================================================== */}

          {filteredCircles.length === 0 ? (

            <div className="circle-empty">

              <h2>
                No Circle here yet.
              </h2>

              <p>
                Ronda grows city by city.
              </p>

              {canCreate && (
                <Link
                  href="/create-circle"
                  className="empty-create"
                >
                  Create the first Circle
                </Link>
              )}

            </div>

          ) : (

            /* ================================================================
               CIRCLES GRID
            ================================================================ */

            <div className="circles-grid">

              {filteredCircles.map(
                (circle) => {

                  const type =
                    normalizeType(
                      circle.type ||
                      circle.category
                    )

                  const count =
                    Number(
                      circle.members_count ||
                      0
                    )

                  const creator =
                    creatorNames[
                      circle.created_by
                    ] ||
                    circle.created_by_name ||
                    'Ronda member'

                  const city =
                    getCircleCity(
                      circle
                    )

                  const description =
                    String(
                      circle.description ||
                      ''
                    )
                      .trim()

                  const typeClass =
                    type
                      .toLowerCase()

                  return (
                    <article
                      key={circle.id}
                      className="circle-card"
                    >


                      {/* TYPE + MEMBER COUNT */}

                      <div className="circle-card-top">

                        <span
                          className={
                            `circle-type circle-type-${typeClass}`
                          }
                        >
                          {type}
                        </span>


                        <span className="circle-members">
                          {count}{' '}
                          {count === 1
                            ? 'member'
                            : 'members'}
                        </span>

                      </div>


                      {/* NAME */}

                      <Link
                        href={`/circles/${circle.id}`}
                        className="circle-name"
                      >
                        {buildCircleName(
                          circle
                        )}
                      </Link>


                      {/* CREATOR */}

                      <p className="circle-created">
                        Created by{' '}
                        <strong>
                          {creator}
                        </strong>
                      </p>


                      {/* DESCRIPTION */}

                      {description ? (
                        <p className="circle-description">
                          {description}
                        </p>
                      ) : (
                        <p className="circle-description circle-description-empty">
                          Discover people from this Circle
                          and connect privately.
                        </p>
                      )}


                      {/* FOOTER */}

                      <div className="circle-card-bottom">

                        <span className="circle-city">

                          {city
                            ? city.toUpperCase()
                            : 'RONDA CIRCLE'}

                        </span>


                        <Link
                          href={`/circles/${circle.id}`}
                          className="circle-view"
                        >
                          View Circle
                        </Link>

                      </div>

                    </article>
                  )
                }
              )}

            </div>

          )}

        </div>

      </main>

      <Footer />


      <style jsx>{`

        /* ==================================================================
           PAGE
        ================================================================== */

        .circles-page {
          min-height: 100vh;

          background:
            #FFF8F2;

          padding:
            145px 24px 72px;

          box-sizing:
            border-box;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          color:
            #2B2725;
        }


        .circles-container {
          width:
            100%;

          max-width:
            1100px;

          margin:
            0 auto;
        }


        .circles-loading {
          margin:
            0;

          padding:
            80px 0;

          text-align:
            center;

          font-size:
            0.86rem;

          color:
            #9A918B;
        }


        /* ==================================================================
           HERO
        ================================================================== */

        .circles-hero {
          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          gap:
            34px;

          margin-bottom:
            30px;
        }


        .circles-hero-copy {
          min-width:
            0;
        }


        .circles-eyebrow {
          margin:
            0 0 8px;

          font-size:
            0.7rem;

          font-weight:
            700;

          letter-spacing:
            0.12em;

          text-transform:
            uppercase;

          color:
            #FF6B5A;
        }


        .circles-hero h1 {
          max-width:
            650px;

          margin:
            0 0 12px;

          font-size:
            clamp(
              1.9rem,
              4vw,
              2.65rem
            );

          line-height:
            1.06;

          letter-spacing:
            -0.045em;

          color:
            #25211F;
        }


        .circles-intro {
          max-width:
            650px;

          margin:
            0 0 6px;

          font-size:
            0.96rem;

          line-height:
            1.55;

          color:
            #5F5A56;
        }


        .circles-explanation {
          margin:
            0;

          font-size:
            0.78rem;

          line-height:
            1.5;

          color:
            #9A918B;
        }


        /* ==================================================================
           CREATE
        ================================================================== */

        .create-circle-button,
        .empty-create {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          flex-shrink:
            0;

          padding:
            11px 24px;

          border-radius:
            999px;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          text-decoration:
            none;

          font-size:
            0.82rem;

          font-weight:
            650;

          box-shadow:
            0 4px 12px
            rgba(
              255,
              107,
              90,
              0.14
            );

          transition:
            background 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }


        .create-circle-button:hover,
        .empty-create:hover {
          background:
            #F45542;

          transform:
            translateY(-1px);

          box-shadow:
            0 6px 16px
            rgba(
              255,
              107,
              90,
              0.2
            );
        }


        /* ==================================================================
           UNLOCK
        ================================================================== */

        .create-unlock {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            24px;

          padding:
            15px 18px;

          margin-bottom:
            24px;

          border:
            1px solid
            #E9DDD4;

          border-radius:
            14px;

          background:
            rgba(
              255,
              255,
              255,
              0.68
            );
        }


        .create-unlock-copy {
          display:
            flex;

          flex-direction:
            column;

          gap:
            3px;
        }


        .create-unlock-copy strong {
          font-size:
            0.82rem;

          color:
            #393532;
        }


        .create-unlock-copy span {
          font-size:
            0.74rem;

          color:
            #817A75;
        }


        .unlock-right {
          width:
            150px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            flex-end;

          gap:
            5px;

          flex-shrink:
            0;
        }


        .unlock-count {
          font-size:
            0.76rem;

          font-weight:
            700;

          color:
            #FF6B5A;
        }


        .unlock-progress {
          width:
            100%;

          height:
            4px;

          border-radius:
            999px;

          background:
            #EFE8E3;

          overflow:
            hidden;
        }


        .unlock-progress-fill {
          height:
            100%;

          border-radius:
            inherit;

          background:
            #FF6B5A;
        }


        /* ==================================================================
           FILTERS
        ================================================================== */

        .circle-filters {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            18px;

          margin-bottom:
            22px;
        }


        .circle-search {
          width:
            min(
              410px,
              100%
            );

          height:
            44px;

          padding:
            0 18px;

          box-sizing:
            border-box;

          border:
            1px solid
            #E6E1DD;

          border-radius:
            999px;

          background:
            #FFFFFF;

          outline:
            none;

          font-family:
            inherit;

          font-size:
            0.82rem;

          color:
            #393532;

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .circle-search::placeholder {
          color:
            #A39D98;
        }


        .circle-search:focus {
          border-color:
            #FFB7AB;

          box-shadow:
            0 0 0 3px
            rgba(
              255,
              107,
              90,
              0.06
            );
        }


        .circle-type-filters {
          display:
            flex;

          align-items:
            center;

          gap:
            7px;
        }


        .circle-filter {
          min-width:
            65px;

          padding:
            8px 14px;

          border:
            1px solid
            #E9DDD4;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            #706965;

          font-family:
            inherit;

          font-size:
            0.74rem;

          font-weight:
            600;

          cursor:
            pointer;

          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease;
        }


        .circle-filter:hover {
          border-color:
            #E1C9C0;

          color:
            #FF604E;
        }


        .circle-filter.active {
          background:
            #FFF0EB;

          border-color:
            #FFC2B8;

          color:
            #FF604E;
        }


        /* ==================================================================
           GRID
        ================================================================== */

        .circles-grid {
          display:
            grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap:
            14px;
        }


        .circle-card {
          min-height:
            205px;

          display:
            flex;

          flex-direction:
            column;

          padding:
            20px;

          box-sizing:
            border-box;

          border:
            1px solid
            #E7E2DE;

          border-radius:
            17px;

          background:
            #FFFFFF;

          box-shadow:
            0 2px 8px
            rgba(
              43,
              39,
              37,
              0.018
            );

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }


        .circle-card:hover {
          transform:
            translateY(-2px);

          border-color:
            #DDD5CF;

          box-shadow:
            0 10px 26px
            rgba(
              43,
              39,
              37,
              0.055
            );
        }


        /* ==================================================================
           TOP
        ================================================================== */

        .circle-card-top {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            12px;

          margin-bottom:
            14px;
        }


        .circle-type {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            5px 11px;

          border-radius:
            999px;

          font-size:
            0.68rem;

          font-weight:
            700;

          line-height:
            1;
        }


        /*
         * FRIENDS
         */

        .circle-type-friends {
          background:
            #FFF0EB;

          color:
            #FF604E;
        }


        /*
         * DATE
         */

        .circle-type-date {
          background:
            #FFF0F6;

          color:
            #D94D87;
        }


        /*
         * BUSINESS
         */

        .circle-type-business {
          background:
            #EDF5FF;

          color:
            #397DC1;
        }


        .circle-members {
          font-size:
            0.7rem;

          color:
            #9A918B;

          white-space:
            nowrap;
        }


        /* ==================================================================
           NAME
        ================================================================== */

        .circle-name {
          display:
            block;

          margin-bottom:
            5px;

          color:
            #2B2725;

          text-decoration:
            none;

          font-size:
            1.05rem;

          font-weight:
            720;

          line-height:
            1.3;

          letter-spacing:
            -0.02em;

          transition:
            color 0.18s ease;
        }


        .circle-name:hover {
          color:
            #FF604E;
        }


        /* ==================================================================
           CREATOR
        ================================================================== */

        .circle-created {
          margin:
            0 0 11px;

          font-size:
            0.7rem;

          line-height:
            1.4;

          color:
            #9A918B;
        }


        .circle-created strong {
          color:
            #706965;

          font-weight:
            600;
        }


        /* ==================================================================
           DESCRIPTION
        ================================================================== */

        .circle-description {
          flex:
            1;

          margin:
            0 0 16px;

          font-size:
            0.79rem;

          line-height:
            1.52;

          color:
            #5F5A56;

          display:
            -webkit-box;

          -webkit-line-clamp:
            3;

          -webkit-box-orient:
            vertical;

          overflow:
            hidden;
        }


        .circle-description-empty {
          color:
            #A09A95;
        }


        /* ==================================================================
           CARD BOTTOM
        ================================================================== */

        .circle-card-bottom {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            12px;

          padding-top:
            13px;

          border-top:
            1px solid
            #F0EBE6;
        }


        .circle-city {
          min-width:
            0;

          overflow:
            hidden;

          text-overflow:
            ellipsis;

          white-space:
            nowrap;

          font-size:
            0.64rem;

          font-weight:
            700;

          letter-spacing:
            0.07em;

          color:
            #817A75;
        }


        .circle-view {
          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          flex-shrink:
            0;

          padding:
            7px 15px;

          border-radius:
            999px;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          text-decoration:
            none;

          font-size:
            0.7rem;

          font-weight:
            650;

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
            transform 0.18s ease;
        }


        .circle-view:hover {
          background:
            #F45542;

          transform:
            translateY(-1px);
        }


        /* ==================================================================
           EMPTY
        ================================================================== */

        .circle-empty {
          padding:
            60px 24px;

          text-align:
            center;

          border:
            1px solid
            #E9DDD4;

          border-radius:
            18px;

          background:
            #FFFFFF;
        }


        .circle-empty h2 {
          margin:
            0 0 7px;

          font-size:
            1.18rem;

          color:
            #2B2725;
        }


        .circle-empty p {
          margin:
            0 0 20px;

          color:
            #817A75;

          font-size:
            0.84rem;
        }


        /* ==================================================================
           TABLET
        ================================================================== */

        @media (max-width: 800px) {

          .circles-page {
            padding:
              130px 18px 52px;
          }


          .circles-hero {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              20px;
          }


          .circle-filters {
            align-items:
              stretch;

            flex-direction:
              column;
          }


          .circle-search {
            width:
              100%;
          }


          .circle-type-filters {
            justify-content:
              flex-start;
          }

        }


        /* ==================================================================
           MOBILE
        ================================================================== */

        @media (max-width: 640px) {

          .circles-page {
            padding:
              130px 12px 42px;
          }


          .circles-hero {
            margin-bottom:
              22px;
          }


          .circles-hero h1 {
            font-size:
              1.7rem;
          }


          .circles-intro {
            font-size:
              0.88rem;
          }


          .circles-explanation {
            font-size:
              0.74rem;
          }


          .create-circle-button {
            width:
              100%;

            box-sizing:
              border-box;
          }


          .create-unlock {
            align-items:
              flex-start;

            flex-direction:
              column;

            gap:
              12px;

            padding:
              14px;
          }


          .unlock-right {
            width:
              100%;

            align-items:
              flex-start;
          }


          .circle-type-filters {
            display:
              grid;

            grid-template-columns:
              repeat(
                4,
                1fr
              );

            width:
              100%;

            gap:
              5px;
          }


          .circle-filter {
            min-width:
              0;

            padding:
              8px 3px;

            font-size:
              0.67rem;
          }


          .circles-grid {
            grid-template-columns:
              1fr;

            gap:
              10px;
          }


          .circle-card {
            min-height:
              0;

            padding:
              17px;
          }


          .circle-card-top {
            margin-bottom:
              12px;
          }


          .circle-name {
            font-size:
              1rem;
          }


          .circle-description {
            font-size:
              0.76rem;
          }


          .circle-view {
            padding:
              7px 13px;
          }

        }

      `}</style>

    </>
  )
}
