'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'
import { onAuthChange, signOut } from '@/lib/auth'
import { getUserProfile, updateUserProfile } from '@/lib/users'
import Button from '@/components/ui/Button'
import { deleteUser } from 'firebase/auth'
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const INTENTION_OPTIONS = [
  'Friends',
  'Date',
  'Business',
]

const MAX_INTRO_CHARS = 180

function normalizeOldIntention(value = '') {
  const item = String(value).trim().toLowerCase()

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
    item === 'work' ||
    item === 'business' ||
    item === 'job' ||
    item === 'jobs' ||
    item === 'professional' ||
    item === 'networking'
  ) {
    return 'Business'
  }

  return ''
}

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState(null)

  const [connectionCount, setConnectionCount] = useState(0)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [gender, setGender] = useState('')
  const [intentions, setIntentions] = useState([])
  const [introduction, setIntroduction] = useState('')

  useEffect(() => {
    const unsub = onAuthChange(async (u) => {
      if (!u) {
        router.push('/login')
        return
      }

      setUser(u)

      try {
        const p = await getUserProfile(u.uid)

        setProfile(p)

        setName(
          p?.name ||
          p?.displayName ||
          u.displayName ||
          ''
        )

        setCity(
          String(p?.city || '').toUpperCase()
        )

        setGender(
          p?.gender ||
          ''
        )

        const oldIntentions =
          Array.isArray(p?.intentions)
            ? p.intentions
            : []

        const normalized =
          oldIntentions
            .map(normalizeOldIntention)
            .filter(Boolean)

        setIntentions(
          normalized.length
            ? [normalized[0]]
            : []
        )

        setIntroduction(
          String(
            p?.introduction ||
            p?.bio ||
            ''
          ).slice(0, MAX_INTRO_CHARS)
        )

        const connectionsQuery = query(
          collection(db, 'connections'),
          where(
            'participants',
            'array-contains',
            u.uid
          )
        )

        const connectionsSnapshot =
          await getDocs(connectionsQuery)

        const connectedCount =
          connectionsSnapshot.docs.filter(
            (connectionDoc) =>
              connectionDoc.data()?.status === 'connected'
          ).length

        setConnectionCount(connectedCount)

      } catch (err) {
        console.error(
          'Error loading profile:',
          err
        )
      }
    })

    return () => unsub()
  }, [router])

  function selectIntention(value) {
    setIntentions([value])
  }

  function handleIntroductionChange(event) {
    setIntroduction(
      event.target.value.slice(
        0,
        MAX_INTRO_CHARS
      )
    )
  }

  async function handleSave() {
    if (!user) return

    const cleanName =
      name.trim()

    const cleanCity =
      city
        .trim()
        .toUpperCase()

    const cleanIntroduction =
      introduction
        .trim()
        .slice(0, MAX_INTRO_CHARS)

    if (!cleanName) {
      window.alert(
        'Please enter your name.'
      )
      return
    }

    if (!cleanCity) {
      window.alert(
        'Please enter your city.'
      )
      return
    }

    if (!intentions.length) {
      window.alert(
        'Please choose Friends, Date or Business.'
      )
      return
    }

    setSaving(true)

    try {
      const googlePhoto =
        user.photoURL ||
        ''

      const updatedProfile = {
        name: cleanName,

        city: cleanCity,

        gender,

        intentions,

        introduction:
          cleanIntroduction,

        photoURL:
          googlePhoto,

        photo_url:
          googlePhoto,
      }

      await updateUserProfile(
        user.uid,
        updatedProfile
      )

      setName(cleanName)
      setCity(cleanCity)
      setIntroduction(
        cleanIntroduction
      )

      setProfile((current) => ({
        ...current,
        ...updatedProfile,
      }))

      setEditing(false)
    } catch (err) {
      console.error(
        'Error saving profile:',
        err
      )

      window.alert(
        'Your profile could not be saved. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  async function handleDeleteProfile() {
    if (!user || deleting) return

    const confirmed =
      window.confirm(
        'Delete your Ronda profile permanently? This action cannot be undone.'
      )

    if (!confirmed) return

    setDeleting(true)

    try {
      await deleteDoc(
        doc(
          db,
          'users',
          user.uid
        )
      )

      await deleteUser(user)

      router.push('/')
    } catch (err) {
      console.error(
        'Error deleting profile:',
        err
      )

      if (
        err?.code ===
        'auth/requires-recent-login'
      ) {
        window.alert(
          'For security reasons, please sign out, sign in again, then delete your profile.'
        )
      } else {
        window.alert(
          'Your profile could not be deleted. Please try again.'
        )
      }
    } finally {
      setDeleting(false)
    }
  }

  if (!profile) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight: '70vh',
            paddingTop: '150px',
            textAlign: 'center',
            background: '#FFF8F2',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border:
                '3px solid #FF6B5A',
              borderTopColor:
                'transparent',
              borderRadius: '50%',
              animation:
                'spin 0.7s linear infinite',
              margin: '0 auto',
            }}
          />
        </div>

        <Footer />

        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    )
  }

  const photo =
    user?.photoURL ||
    '/point.png'

  const unlockTarget = 20

  const progress =
    Math.min(
      100,
      Math.round(
        (connectionCount /
          unlockTarget) *
          100
      )
    )

  const remainingConnections =
    Math.max(
      0,
      unlockTarget -
      connectionCount
    )

  return (
    <>
      <Navbar />

      <div
        style={{
          paddingTop: '110px',
          minHeight: '100vh',
          background: '#FFF8F2',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding:
              '32px 20px 60px',
          }}
        >

          {/* PROFIL */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              marginBottom: '20px',
            }}
          >
            <img
              src={photo}
              alt={
                profile.name ||
                'Ronda member'
              }
              onError={(event) => {
                event.currentTarget.src =
                  '/point.png'
              }}
              style={{
                width: 82,
                height: 82,
                borderRadius: '50%',
                objectFit: 'cover',
                border:
                  '3px solid #FFFFFF',
                boxShadow:
                  '0 0 0 1px #E9DDD4',
                background: '#fff',
              }}
            />

            <div>
              <h1
                style={{
                  fontFamily:
                    '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',
                  fontSize:
                    '1.55rem',
                  fontWeight: 700,
                  color: '#2B2725',
                  margin:
                    '0 0 5px',
                }}
              >
                {profile.name ||
                  'Ronda member'}
              </h1>

              {profile.city && (
                <div
                  style={{
                    color: '#706965',
                    fontSize:
                      '0.88rem',
                  }}
                >
                  {String(
                    profile.city
                  ).toUpperCase()}
                </div>
              )}
            </div>
          </div>


          {/* INTENTION */}

          {Array.isArray(
            profile.intentions
          ) &&
            profile.intentions.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    '12px',
                }}
              >
                <span
                  style={{
                    background:
                      '#FFF0EB',
                    color:
                      '#FF6B5A',
                    borderRadius:
                      999,
                    padding:
                      '6px 12px',
                    fontSize:
                      '0.76rem',
                    fontWeight:
                      600,
                  }}
                >
                  {
                    profile
                      .intentions[0]
                  }
                </span>
              </div>
            )}


          {/* INTRODUCTION */}

          {profile.introduction && (
            <p
              style={{
                color: '#706965',
                fontSize:
                  '0.88rem',
                lineHeight: 1.55,
                margin:
                  '0 0 26px',
              }}
            >
              {profile.introduction}
            </p>
          )}


          {/* CONNECTIONS */}

          <div
            style={{
              background:
                '#FFFFFF',
              border:
                '1px solid #E9DDD4',
              borderRadius:
                '18px',
              padding: '22px',
              marginBottom:
                '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'baseline',
                marginBottom:
                  '14px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      '0.78rem',
                    fontWeight: 600,
                    color:
                      '#817A75',
                    marginBottom:
                      '4px',
                  }}
                >
                  Your connections
                </div>

                <div
                  style={{
                    fontSize:
                      '1.7rem',
                    fontWeight: 700,
                  }}
                >
                  {connectionCount}

                  <span
                    style={{
                      color:
                        '#A39C97',
                      fontSize:
                        '1rem',
                    }}
                  >
                    {' '}
                    / {unlockTarget}
                  </span>
                </div>
              </div>

              <Link
                href="/members"
                style={{
                  color:
                    '#FF6B5A',
                  fontSize:
                    '0.8rem',
                  fontWeight: 600,
                  textDecoration:
                    'none',
                }}
              >
                Find people →
              </Link>
            </div>

            <div
              style={{
                width: '100%',
                height: 7,
                background:
                  '#F3EEEA',
                borderRadius:
                  999,
                overflow:
                  'hidden',
              }}
            >
              <div
                style={{
                  width:
                    `${progress}%`,
                  height:
                    '100%',
                  background:
                    '#FF6B5A',
                  borderRadius:
                    999,
                }}
              />
            </div>

            <p
              style={{
                color: '#817A75',
                fontSize:
                  '0.77rem',
                margin:
                  '10px 0 0',
              }}
            >
              {remainingConnections >
              0
                ? `${remainingConnections} more connection${remainingConnections !== 1 ? 's' : ''} to unlock Meetups.`
                : 'Meetups unlocked. You can now create a meetup.'}
            </p>
          </div>


          {/* EDIT */}

          {editing ? (
            <div
              style={{
                background:
                  '#FFFFFF',
                border:
                  '1px solid #E9DDD4',
                borderRadius:
                  '18px',
                padding: '22px',
                marginBottom:
                  '20px',
              }}
            >
              <h2
                style={{
                  fontSize:
                    '1.05rem',
                  margin:
                    '0 0 20px',
                }}
              >
                Edit profile
              </h2>


              {/* NAME */}

              <div
                style={{
                  marginBottom:
                    '16px',
                }}
              >
                <label>
                  Display name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  style={{
                    width: '100%',
                    padding:
                      '11px 13px',
                    marginTop:
                      '6px',
                    borderRadius:
                      '10px',
                    border:
                      '1px solid #E9DDD4',
                    boxSizing:
                      'border-box',
                  }}
                />
              </div>


              {/* CITY */}

              <div
                style={{
                  marginBottom:
                    '16px',
                }}
              >
                <label>
                  City *
                </label>

                <input
                  value={city}
                  onChange={(e) =>
                    setCity(
                      e.target.value
                        .toUpperCase()
                    )
                  }
                  style={{
                    width: '100%',
                    padding:
                      '11px 13px',
                    marginTop:
                      '6px',
                    borderRadius:
                      '10px',
                    border:
                      '1px solid #E9DDD4',
                    boxSizing:
                      'border-box',
                  }}
                />
              </div>


              {/* GENDER */}

              <div
                style={{
                  marginBottom:
                    '18px',
                }}
              >
                <label>
                  Gender
                </label>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '8px',
                    flexWrap:
                      'wrap',
                    marginTop:
                      '8px',
                  }}
                >
                  {[
                    ['female', 'Female'],
                    ['male', 'Male'],
                    ['', 'Prefer not to say'],
                  ].map(
                    ([value, label]) => (
                      <button
                        key={
                          value ||
                          'none'
                        }
                        type="button"
                        onClick={() =>
                          setGender(
                            value
                          )
                        }
                        style={{
                          border:
                            gender ===
                            value
                              ? '1px solid #FF6B5A'
                              : '1px solid #E9DDD4',

                          background:
                            gender ===
                            value
                              ? '#FFF0EB'
                              : '#FFFFFF',

                          color:
                            gender ===
                            value
                              ? '#FF6B5A'
                              : '#706965',

                          borderRadius:
                            999,

                          padding:
                            '7px 13px',

                          cursor:
                            'pointer',
                        }}
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>


              {/* INTENTION */}

              <div
                style={{
                  marginBottom:
                    '18px',
                }}
              >
                <label>
                  I want to meet people for
                </label>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '8px',
                    marginTop:
                      '8px',
                  }}
                >
                  {INTENTION_OPTIONS.map(
                    (option) => {
                      const active =
                        intentions[0] ===
                        option

                      return (
                        <button
                          key={
                            option
                          }
                          type="button"
                          onClick={() =>
                            selectIntention(
                              option
                            )
                          }
                          style={{
                            border:
                              active
                                ? '1px solid #FF6B5A'
                                : '1px solid #E9DDD4',

                            background:
                              active
                                ? '#FFF0EB'
                                : '#FFFFFF',

                            color:
                              active
                                ? '#FF6B5A'
                                : '#706965',

                            borderRadius:
                              999,

                            padding:
                              '7px 14px',

                            cursor:
                              'pointer',

                            fontWeight:
                              600,
                          }}
                        >
                          {option}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>


              {/* INTRO */}

              <div
                style={{
                  marginBottom:
                    '20px',
                }}
              >
                <label>
                  Introduce yourself in a few words
                </label>

                <textarea
                  value={
                    introduction
                  }
                  maxLength={
                    MAX_INTRO_CHARS
                  }
                  onChange={
                    handleIntroductionChange
                  }
                  placeholder="Tell people a little about yourself..."
                  rows={4}
                  style={{
                    width: '100%',
                    marginTop:
                      '6px',
                    padding:
                      '11px 13px',
                    borderRadius:
                      '10px',
                    border:
                      '1px solid #E9DDD4',
                    resize:
                      'vertical',
                    fontFamily:
                      '"Avenir Next", "Segoe UI", Inter, system-ui, sans-serif',
                    boxSizing:
                      'border-box',
                  }}
                />

                <div
                  style={{
                    textAlign:
                      'right',
                    color:
                      introduction.length >=
                      MAX_INTRO_CHARS
                        ? '#FF6B5A'
                        : '#A39C97',
                    fontSize:
                      '0.68rem',
                    marginTop:
                      '4px',
                  }}
                >
                  {introduction.length} / {MAX_INTRO_CHARS}
                </div>
              </div>


              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <Button
                  onClick={
                    handleSave
                  }
                  loading={
                    saving
                  }
                  size="sm"
                >
                  Save
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    setEditing(
                      false
                    )
                  }
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() =>
                setEditing(true)
              }
              style={{
                marginBottom:
                  '20px',
                width: '100%',
              }}
            >
              Edit profile
            </Button>
          )}


          {/* NAV */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '10px',
              marginBottom:
                '28px',
            }}
          >
            <Link
              href="/members"
              style={{
                padding:
                  '12px',
                textAlign:
                  'center',
                border:
                  '1px solid #E9DDD4',
                borderRadius:
                  '12px',
                background:
                  '#FFFFFF',
                color:
                  '#2B2725',
                textDecoration:
                  'none',
              }}
            >
              People
            </Link>

            <Link
              href="/messages"
              style={{
                padding:
                  '12px',
                textAlign:
                  'center',
                border:
                  '1px solid #E9DDD4',
                borderRadius:
                  '12px',
                background:
                  '#FFFFFF',
                color:
                  '#2B2725',
                textDecoration:
                  'none',
              }}
            >
              Messages
            </Link>
          </div>


          <button
            onClick={
              handleSignOut
            }
            style={{
              width: '100%',
              padding: '12px',
              borderRadius:
                '12px',
              border:
                '1px solid #E9DDD4',
              background:
                'transparent',
              color:
                '#817A75',
              cursor:
                'pointer',
              marginBottom:
                '14px',
            }}
          >
            Sign out
          </button>


          <button
            onClick={
              handleDeleteProfile
            }
            disabled={
              deleting
            }
            style={{
              width: '100%',
              padding: '10px',
              border: 'none',
              background:
                'transparent',
              color:
                '#C76D64',
              cursor:
                deleting
                  ? 'default'
                  : 'pointer',
              opacity:
                deleting
                  ? 0.6
                  : 1,
            }}
          >
            {deleting
              ? 'Deleting profile...'
              : 'Delete profile'}
          </button>

        </div>
      </div>

      <Footer />
    </>
  )
}