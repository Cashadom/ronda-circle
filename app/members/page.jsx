'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

const CORAL = '#FF6B5A'

export default function MembersPage() {
  const router = useRouter()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visibleCount, setVisibleCount] = useState(30)

  useEffect(() => {
    async function fetchMembers() {
      try {
        const usersSnapshot =
          await getDocs(
            collection(db, 'users')
          )

        const users =
          usersSnapshot.docs.map(
            (doc) => {
              const data = doc.data()

              const photo =
                data.photoURL ||
                data.photo_url ||
                ''

              return {
                uid: doc.id,

                name:
                  data.name ||
                  data.displayName ||
                  data.username ||
                  'Ronda member',

                photoUrl:
                  photo ||
                  '/point.png',

                hasRealPhoto:
                  Boolean(photo),

                city:
                  String(
                    data.city || ''
                  ).toUpperCase(),

                gender:
                  data.gender ||
                  '',

                intentions:
                  Array.isArray(
                    data.intentions
                  )
                    ? data.intentions
                    : [],

                introduction:
                  data.introduction ||
                  data.bio ||
                  '',

                connectionsCount:
                  Number(
                    data.connections_count ||
                    data.connectionsCount ||
                    0
                  ),
              }
            }
          )

        const sortedMembers =
          [...users].sort(
            (a, b) => {
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

              return 0
            }
          )

        setMembers(
          sortedMembers
        )
      } catch (err) {
        console.error(
          'Error loading members:',
          err
        )

        setError(
          'Could not load people. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const loadMore = () => {
    setVisibleCount(
      (prev) => prev + 30
    )
  }

  const visibleMembers =
    members.slice(
      0,
      visibleCount
    )

  const hasMore =
    visibleCount <
    members.length

  const totalMembers =
    members.length

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: '100vh',
          background: '#FFF8F2',
          padding:
            '120px clamp(20px, 5vw, 40px) 60px',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >

          {/* BACK */}

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <button
              onClick={() =>
                router.back()
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,

                background:
                  'transparent',

                border: 'none',

                color: '#706965',

                fontSize:
                  '0.85rem',

                cursor:
                  'pointer',

                padding:
                  '8px 0',
              }}
            >
              <ArrowLeft
                size={16}
              />

              Back
            </button>
          </div>


          {/* HEADER */}

          <div
            style={{
              marginBottom: 30,
            }}
          >
            <h1
              style={{
                fontFamily:
                  '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                fontSize:
                  'clamp(2rem, 4vw, 2.8rem)',

                fontWeight: 700,

                color:
                  '#2B2725',

                margin:
                  '0 0 8px',

                letterSpacing:
                  '-0.03em',
              }}
            >
              People
            </h1>

            <p
              style={{
                color:
                  '#706965',

                fontSize:
                  '0.95rem',

                margin: 0,
              }}
            >
              {totalMembers > 0
                ? `${totalMembers} people on Ronda. Find your people, simply connect.`
                : 'Find your people, simply connect.'}
            </p>
          </div>


          {/* ERROR */}

          {error && (
            <div
              style={{
                background:
                  '#FFF0EB',

                color:
                  CORAL,

                padding:
                  '12px 16px',

                borderRadius:
                  12,

                marginBottom:
                  24,
              }}
            >
              {error}
            </div>
          )}


          {/* LOADING */}

          {loading ? (
            <div
              style={{
                display: 'grid',
                gap: 8,
              }}
            >
              {Array.from({
                length: 10,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    style={{
                      height: 62,
                      borderRadius:
                        10,

                      background:
                        index % 2 ===
                        0
                          ? '#F4F9FC'
                          : '#FAFCFD',

                      animation:
                        'pulse 1.5s infinite',
                    }}
                  />
                )
              )}
            </div>
          ) : members.length === 0 ? (
            <div
              style={{
                textAlign:
                  'center',

                padding:
                  '60px 20px',

                background:
                  '#FFFFFF',

                borderRadius:
                  18,

                border:
                  '1px solid #E9DDD4',
              }}
            >
              <p
                style={{
                  color:
                    '#706965',

                  margin: 0,
                }}
              >
                No people found yet.
              </p>
            </div>
          ) : (
            <>

              {/* PEOPLE LIST */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr',
                  gap: 8,
                }}
              >
                {visibleMembers.map(
                  (
                    member,
                    index
                  ) => {
                    const genderColor =
                      member.gender ===
                      'female'
                        ? '#E93C87'
                        : member.gender ===
                            'male'
                          ? '#3478C5'
                          : '#343434'

                    const formattedIntentions =
                      member.intentions
                        .slice(0, 5)
                        .map(
                          (item) =>
                            String(
                              item
                            ).toLowerCase()
                        )
                        .join(' - ')

                    return (
                      <div
                        key={
                          member.uid
                        }
                        style={{
                          display:
                            'flex',

                          alignItems:
                            'center',

                          justifyContent:
                            'space-between',

                          gap: 18,

                          width:
                            '100%',

                          boxSizing:
                            'border-box',

                          padding:
                            '11px 14px',

                          background:
                            index % 2 ===
                            0
                              ? '#F4F9FC'
                              : '#FAFCFD',

                          border:
                            '1px solid rgba(43,39,37,0.04)',

                          borderRadius:
                            10,
                        }}
                      >

                        {/* LEFT */}

                        <div
                          style={{
                            display:
                              'flex',

                            alignItems:
                              'center',

                            gap: 12,

                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <img
                            src={
                              member.photoUrl
                            }
                            alt={
                              member.name
                            }
                            onError={(
                              event
                            ) => {
                              event.currentTarget.src =
                                '/point.png'
                            }}
                            style={{
                              width: 42,
                              height: 42,

                              flex:
                                '0 0 42px',

                              borderRadius:
                                '50%',

                              objectFit:
                                'cover',

                              background:
                                '#FFFFFF',

                              border:
                                '2px solid #FFFFFF',

                              boxShadow:
                                '0 2px 8px rgba(43,39,37,0.07)',
                            }}
                          />

                          <div
                            style={{
                              minWidth: 0,

                              fontFamily:
                                '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                              fontSize:
                                '0.9rem',

                              lineHeight:
                                1.45,

                              color:
                                '#4B4642',
                            }}
                          >
                            <div>
                              <span
                                style={{
                                  fontWeight:
                                    700,

                                  color:
                                    genderColor,
                                }}
                              >
                                {
                                  member.name
                                }
                              </span>

                              {member.gender && (
                                <span
                                  style={{
                                    color:
                                      '#817A75',

                                    fontWeight:
                                      600,
                                  }}
                                >
                                  {member.gender ===
                                  'female'
                                    ? ' ♀'
                                    : member.gender ===
                                        'male'
                                      ? ' ♂'
                                      : ''}
                                </span>
                              )}

                              <span>
                                {' '}
                                from{' '}
                                {member.city ||
                                  'YOUR CITY'}{' '}
                                has interest to meet people
                              </span>

                              {formattedIntentions && (
                                <>
                                  <span>
                                    {' '}
                                    for{' '}
                                  </span>

                                  <span
                                    style={{
                                      color:
                                        '#FF604E',

                                      fontWeight:
                                        600,
                                    }}
                                  >
                                    {
                                      formattedIntentions
                                    }
                                  </span>
                                </>
                              )}
                            </div>

                            {member.introduction && (
                              <div
                                style={{
                                  marginTop:
                                    2,

                                  color:
                                    '#817A75',

                                  fontSize:
                                    '0.76rem',

                                  whiteSpace:
                                    'nowrap',

                                  overflow:
                                    'hidden',

                                  textOverflow:
                                    'ellipsis',

                                  maxWidth:
                                    '760px',
                                }}
                              >
                                {
                                  member.introduction
                                }
                              </div>
                            )}
                          </div>
                        </div>


                        {/* CONNECT */}

                        <Link
                          href={`/members/${member.uid}`}
                          style={{
                            flexShrink: 0,

                            display:
                              'inline-flex',

                            alignItems:
                              'center',

                            justifyContent:
                              'center',

                            minWidth:
                              88,

                            padding:
                              '7px 18px',

                            background:
                              CORAL,

                            color:
                              '#FFFFFF',

                            borderRadius:
                              999,

                            textDecoration:
                              'none',

                            fontFamily:
                              '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',

                            fontSize:
                              '0.77rem',

                            fontWeight:
                              650,

                            boxShadow:
                              '0 3px 10px rgba(255,107,90,0.14)',
                          }}
                        >
                          connect
                        </Link>

                      </div>
                    )
                  }
                )}
              </div>


              {/* LOAD MORE */}

              {hasMore && (
                <div
                  style={{
                    textAlign:
                      'center',

                    marginTop:
                      32,
                  }}
                >
                  <button
                    onClick={
                      loadMore
                    }
                    style={{
                      background:
                        '#FFFFFF',

                      border:
                        '1px solid #E9DDD4',

                      padding:
                        '10px 24px',

                      borderRadius:
                        999,

                      fontSize:
                        '0.82rem',

                      fontWeight:
                        600,

                      color:
                        '#706965',

                      cursor:
                        'pointer',
                    }}
                  >
                    Show more people
                  </button>
                </div>
              )}

            </>
          )}

        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.5;
          }
        }

        @media (max-width: 640px) {
          div[style*='justify-content: space-between'] {
            gap: 10px;
          }
        }
      `}</style>
    </>
  )
}