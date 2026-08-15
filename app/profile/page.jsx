'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'
import { onAuthChange, signOut } from '@/lib/auth'
import {
  getUserProfile,
  updateUserProfile,
} from '@/lib/users'
import Button from '@/components/ui/Button'

import { deleteUser } from 'firebase/auth'

import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '@/lib/firebase'


const INTENTION_OPTIONS = [
  'Friends',
  'Date',
  'Business',
]

const MAX_INTRO_CHARS = 180
const REQUIRED_CONNECTIONS = 20


/* ==========================================================================
   NORMALIZE INTENTION
============================================================================ */

function normalizeOldIntention(value = '') {
  const item = String(value)
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


/* ==========================================================================
   PROFILE
============================================================================ */

export default function ProfilePage() {
  const router = useRouter()

  const [user, setUser] =
    useState(undefined)

  const [profile, setProfile] =
    useState(null)

  const [
    connectionCount,
    setConnectionCount,
  ] = useState(0)

  const [
    createdCircles,
    setCreatedCircles,
  ] = useState([])

  const [editing, setEditing] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)


  /* PROFILE FIELDS */

  const [name, setName] =
    useState('')

  const [city, setCity] =
    useState('')

  const [gender, setGender] =
    useState('')

  const [intentions, setIntentions] =
    useState([])

  const [
    introduction,
    setIntroduction,
  ] = useState('')


  /* CIRCLE EDIT */

  const [
    editingCircleId,
    setEditingCircleId,
  ] = useState(null)

  const [
    circleCity,
    setCircleCity,
  ] = useState('')

  const [
    circleType,
    setCircleType,
  ] = useState('Friends')

  const [
    circleDescription,
    setCircleDescription,
  ] = useState('')

  const [
    savingCircle,
    setSavingCircle,
  ] = useState(false)

  const [
    archivingCircleId,
    setArchivingCircleId,
  ] = useState(null)


  /* ==========================================================================
     LOAD CREATED CIRCLES
  ========================================================================== */

  async function loadCreatedCircles(uid) {
    if (!uid) {
      setCreatedCircles([])
      return
    }

    try {
      const circlesQuery =
        query(
          collection(
            db,
            'circles'
          ),
          where(
            'created_by',
            '==',
            uid
          )
        )

      const snapshot =
        await getDocs(
          circlesQuery
        )

      const circles =
        snapshot.docs
          .map(
            (circleDoc) => ({
              id:
                circleDoc.id,

              ...circleDoc.data(),
            })
          )
          .filter(
            (circle) =>
              circle.status !==
              'archived'
          )
          .sort(
            (a, b) => {
              const aTime =
                a.created_at
                  ?.toDate?.()
                  ?.getTime?.() ||
                0

              const bTime =
                b.created_at
                  ?.toDate?.()
                  ?.getTime?.() ||
                0

              return (
                bTime -
                aTime
              )
            }
          )

      setCreatedCircles(
        circles
      )

    } catch (err) {
      console.error(
        'Error loading created circles:',
        err
      )

      setCreatedCircles([])
    }
  }


  /* ==========================================================================
     LOAD PROFILE
  ========================================================================== */

  useEffect(() => {
    const unsub =
      onAuthChange(
        async (u) => {

          if (!u) {
            router.push(
              '/login'
            )

            return
          }

          setUser(u)

          try {
            const p =
              await getUserProfile(
                u.uid
              )

            setProfile(p)


            setName(
              p?.name ||
              p?.displayName ||
              u.displayName ||
              ''
            )


            setCity(
              String(
                p?.city ||
                ''
              ).toUpperCase()
            )


            setGender(
              p?.gender ||
              ''
            )


            const oldIntentions =
              Array.isArray(
                p?.intentions
              )
                ? p.intentions
                : []


            const normalized =
              oldIntentions
                .map(
                  normalizeOldIntention
                )
                .filter(
                  Boolean
                )


            setIntentions(
              normalized.length
                ? [
                    normalized[0],
                  ]
                : []
            )


            setIntroduction(
              String(
                p?.introduction ||
                p?.bio ||
                ''
              ).slice(
                0,
                MAX_INTRO_CHARS
              )
            )


            /* CONNECTIONS */

            const connectionsQuery =
              query(
                collection(
                  db,
                  'connections'
                ),

                where(
                  'participants',
                  'array-contains',
                  u.uid
                )
              )


            const connectionsSnapshot =
              await getDocs(
                connectionsQuery
              )


            const connectedCount =
              connectionsSnapshot.docs
                .filter(
                  (
                    connectionDoc
                  ) =>
                    connectionDoc
                      .data()
                      ?.status ===
                    'connected'
                )
                .length


            setConnectionCount(
              connectedCount
            )


            /* CREATED CIRCLES */

            await loadCreatedCircles(
              u.uid
            )

          } catch (err) {
            console.error(
              'Error loading profile:',
              err
            )
          }
        }
      )

    return () => unsub()

  }, [router])


  /* ==========================================================================
     PROFILE
  ========================================================================== */

  function selectIntention(
    value
  ) {
    setIntentions([
      value,
    ])
  }


  function handleIntroductionChange(
    event
  ) {
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
        .slice(
          0,
          MAX_INTRO_CHARS
        )


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
        name:
          cleanName,

        city:
          cleanCity,

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


      setName(
        cleanName
      )

      setCity(
        cleanCity
      )

      setIntroduction(
        cleanIntroduction
      )


      setProfile(
        (current) => ({
          ...current,
          ...updatedProfile,
        })
      )


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


  /* ==========================================================================
     EDIT CIRCLE
  ========================================================================== */

  function startEditingCircle(
    circle
  ) {
    setEditingCircleId(
      circle.id
    )

    setCircleCity(
      String(
        circle.city ||
        ''
      ).toUpperCase()
    )

    setCircleType(
      normalizeOldIntention(
        circle.type ||
        circle.category
      ) ||
      'Friends'
    )

    setCircleDescription(
      String(
        circle.description ||
        ''
      ).slice(
        0,
        MAX_INTRO_CHARS
      )
    )
  }


  function cancelCircleEdit() {
    setEditingCircleId(
      null
    )

    setCircleCity('')
    setCircleType(
      'Friends'
    )

    setCircleDescription('')
  }


  async function saveCircle(
    circleId
  ) {
    if (
      !user?.uid ||
      !circleId ||
      savingCircle
    ) {
      return
    }

    const cleanCity =
      circleCity
        .trim()
        .toUpperCase()

    const cleanDescription =
      circleDescription
        .trim()
        .slice(
          0,
          MAX_INTRO_CHARS
        )


    if (!cleanCity) {
      window.alert(
        'Please enter a city.'
      )

      return
    }


    if (
      !INTENTION_OPTIONS.includes(
        circleType
      )
    ) {
      window.alert(
        'Please choose Friends, Date or Business.'
      )

      return
    }


    setSavingCircle(true)

    try {
      const circleRef =
        doc(
          db,
          'circles',
          circleId
        )


      /*
       * Title is automatic.
       *
       * Type is shown separately
       * in the Circle badge.
       */

      await updateDoc(
        circleRef,
        {
          title:
            `Ronda Club · ${cleanCity}`,

          city:
            cleanCity,

          type:
            circleType,

          description:
            cleanDescription,

          updated_at:
            serverTimestamp(),
        }
      )


      setCreatedCircles(
        (current) =>
          current.map(
            (circle) =>
              circle.id ===
              circleId
                ? {
                    ...circle,

                    title:
                      `Ronda Club · ${cleanCity}`,

                    city:
                      cleanCity,

                    type:
                      circleType,

                    description:
                      cleanDescription,
                  }
                : circle
          )
      )


      cancelCircleEdit()

    } catch (err) {
      console.error(
        'Error updating Circle:',
        err
      )

      window.alert(
        'This Circle could not be updated.'
      )

    } finally {
      setSavingCircle(false)
    }
  }


  /* ==========================================================================
     ARCHIVE CIRCLE
  ========================================================================== */

  async function archiveCircle(
    circle
  ) {
    if (
      !user?.uid ||
      !circle?.id ||
      archivingCircleId
    ) {
      return
    }


    const confirmed =
      window.confirm(
        `Archive ${circle.title || 'this Circle'}? Members will no longer see it in the Circle directory.`
      )


    if (!confirmed) {
      return
    }


    setArchivingCircleId(
      circle.id
    )


    try {
      await updateDoc(
        doc(
          db,
          'circles',
          circle.id
        ),
        {
          status:
            'archived',

          archived_at:
            serverTimestamp(),

          updated_at:
            serverTimestamp(),
        }
      )


      setCreatedCircles(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              circle.id
          )
      )

    } catch (err) {
      console.error(
        'Error archiving Circle:',
        err
      )

      window.alert(
        'This Circle could not be archived.'
      )

    } finally {
      setArchivingCircleId(
        null
      )
    }
  }


  /* ==========================================================================
     ACCOUNT
  ========================================================================== */

  async function handleSignOut() {
    await signOut()

    router.push('/')
  }


  async function handleDeleteProfile() {
    if (
      !user ||
      deleting
    ) {
      return
    }


    const confirmed =
      window.confirm(
        'Delete your Ronda profile permanently? This action cannot be undone.'
      )


    if (!confirmed) {
      return
    }


    setDeleting(true)

    try {
      await deleteDoc(
        doc(
          db,
          'users',
          user.uid
        )
      )


      await deleteUser(
        user
      )


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


  /* ==========================================================================
     LOADING
  ========================================================================== */

  if (!profile) {
    return (
      <>
        <Navbar />

        <div
          style={{
            minHeight:
              '70vh',

            paddingTop:
              '150px',

            textAlign:
              'center',

            background:
              '#FFF8F2',
          }}
        >

          <div
            style={{
              width:
                32,

              height:
                32,

              border:
                '3px solid #FF6B5A',

              borderTopColor:
                'transparent',

              borderRadius:
                '50%',

              animation:
                'spin 0.7s linear infinite',

              margin:
                '0 auto',
            }}
          />

        </div>

        <Footer />

        <style jsx>{`
          @keyframes spin {
            to {
              transform:
                rotate(360deg);
            }
          }
        `}</style>
      </>
    )
  }


  /* ==========================================================================
     VALUES
  ========================================================================== */

  const photo =
    user?.photoURL ||
    '/point.png'


  const progress =
    Math.min(
      100,

      Math.round(
        (
          connectionCount /
          REQUIRED_CONNECTIONS
        ) *
        100
      )
    )


  const remainingConnections =
    Math.max(
      0,

      REQUIRED_CONNECTIONS -
      connectionCount
    )


  const canCreateCircle =
    connectionCount >=
    REQUIRED_CONNECTIONS


  /* ==========================================================================
     PAGE
  ========================================================================== */

  return (
    <>
      <Navbar />


      <main className="profile-page">

        <div className="profile-container">


          {/* PROFILE HEADER */}

          <section className="profile-header">

            <img
              src={photo}
              alt={
                profile.name ||
                'Ronda member'
              }
              className="profile-photo"
              onError={(event) => {
                event.currentTarget.src =
                  '/point.png'
              }}
            />


            <div>

              <h1>
                {profile.name ||
                  'Ronda member'}
              </h1>


              {profile.city && (
                <div className="profile-city">
                  {String(
                    profile.city
                  ).toUpperCase()}
                </div>
              )}

            </div>

          </section>


          {/* INTENTION */}

          {Array.isArray(
            profile.intentions
          ) &&
            profile.intentions.length >
              0 && (

              <div className="profile-intention">

                {
                  profile
                    .intentions[0]
                }

              </div>
            )}


          {/* INTRODUCTION */}

          {profile.introduction && (

            <p className="profile-introduction">
              {
                profile.introduction
              }
            </p>

          )}


          {/* ================================================================
              CONNECTIONS
          ================================================================ */}

          <section className="profile-card">

            <div className="connections-top">

              <div>

                <p className="section-label">
                  Your connections
                </p>

                <div className="connection-number">

                  {connectionCount}

                  <span>
                    {' '}
                    / {REQUIRED_CONNECTIONS}
                  </span>

                </div>

              </div>


              <Link
                href="/circles"
                className="coral-link"
              >
                Discover Circles →
              </Link>

            </div>


            <div className="progress">

              <div
                className="progress-fill"
                style={{
                  width:
                    `${progress}%`,
                }}
              />

            </div>


            <p className="progress-text">

              {remainingConnections > 0
                ? `${remainingConnections} more connection${remainingConnections !== 1 ? 's' : ''} to unlock Circle creation.`
                : 'Circle creation unlocked. You can now create your own Circle.'}

            </p>


            {canCreateCircle && (

              <Link
                href="/create-circle"
                className="create-circle-link"
              >
                Create a Circle
              </Link>

            )}

          </section>


          {/* ================================================================
              MY CIRCLES
          ================================================================ */}

          <section className="profile-card">

            <div className="my-circles-header">

              <div>

                <p className="section-label">
                  My Circles
                </p>

                <h2>
                  Circles you created
                </h2>

              </div>


              {canCreateCircle && (

                <Link
                  href="/create-circle"
                  className="coral-link"
                >
                  Create +
                </Link>

              )}

            </div>


            {createdCircles.length === 0 ? (

              <div className="circles-empty">

                <p>
                  You haven&apos;t created a Circle yet.
                </p>

                {!canCreateCircle && (
                  <span>
                    Reach 20 connections to create one.
                  </span>
                )}

              </div>

            ) : (

              <div className="my-circles-list">

                {createdCircles.map(
                  (circle) => {

                    const type =
                      normalizeOldIntention(
                        circle.type ||
                        circle.category
                      ) ||
                      'Friends'

                    const circleName =
                      circle.city
                        ? `Ronda Club · ${String(circle.city).toUpperCase()}`
                        : circle.title ||
                          'Ronda Club'

                    const count =
                      Number(
                        circle.members_count ||
                        0
                      )

                    const isEditing =
                      editingCircleId ===
                      circle.id


                    return (
                      <article
                        key={
                          circle.id
                        }
                        className="my-circle"
                      >

                        {!isEditing ? (
                          <>

                            <div className="my-circle-top">

                              <div>

                                <Link
                                  href={`/circles/${circle.id}`}
                                  className="my-circle-name"
                                >
                                  {circleName}
                                </Link>


                                <div className="my-circle-meta">

                                  <span
                                    className={
                                      `circle-type circle-type-${type.toLowerCase()}`
                                    }
                                  >
                                    {type}
                                  </span>


                                  <span>
                                    {count}{' '}
                                    {count === 1
                                      ? 'member'
                                      : 'members'}
                                  </span>

                                </div>

                              </div>


                              <Link
                                href={`/circles/${circle.id}`}
                                className="view-circle"
                              >
                                View
                              </Link>

                            </div>


                            {circle.description && (

                              <p className="my-circle-description">
                                {
                                  circle.description
                                }
                              </p>

                            )}


                            <div className="circle-management">

                              <button
                                type="button"
                                onClick={() =>
                                  startEditingCircle(
                                    circle
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                type="button"
                                className="archive-button"
                                disabled={
                                  archivingCircleId ===
                                  circle.id
                                }
                                onClick={() =>
                                  archiveCircle(
                                    circle
                                  )
                                }
                              >
                                {archivingCircleId ===
                                circle.id
                                  ? 'Archiving...'
                                  : 'Archive'}
                              </button>

                            </div>

                          </>

                        ) : (

                          /* ==================================================
                             EDIT CIRCLE
                          ================================================== */

                          <div className="circle-edit">

                            <h3>
                              Edit Circle
                            </h3>


                            <label>
                              City
                            </label>

                            <input
                              value={
                                circleCity
                              }
                              onChange={
                                (event) =>
                                  setCircleCity(
                                    event
                                      .target
                                      .value
                                      .toUpperCase()
                                  )
                              }
                            />


                            <label>
                              Circle type
                            </label>

                            <div className="circle-type-options">

                              {INTENTION_OPTIONS.map(
                                (
                                  option
                                ) => (

                                  <button
                                    key={
                                      option
                                    }
                                    type="button"
                                    onClick={() =>
                                      setCircleType(
                                        option
                                      )
                                    }
                                    className={
                                      circleType ===
                                      option
                                        ? 'selected'
                                        : ''
                                    }
                                  >
                                    {option}
                                  </button>

                                )
                              )}

                            </div>


                            <label>
                              Circle presentation
                            </label>

                            <textarea
                              rows={4}
                              maxLength={
                                MAX_INTRO_CHARS
                              }
                              value={
                                circleDescription
                              }
                              onChange={
                                (event) =>
                                  setCircleDescription(
                                    event
                                      .target
                                      .value
                                      .slice(
                                        0,
                                        MAX_INTRO_CHARS
                                      )
                                  )
                              }
                            />


                            <div className="character-count">
                              {circleDescription.length}
                              {' / '}
                              {MAX_INTRO_CHARS}
                            </div>


                            <div className="circle-edit-actions">

                              <button
                                type="button"
                                className="save-circle"
                                disabled={
                                  savingCircle
                                }
                                onClick={() =>
                                  saveCircle(
                                    circle.id
                                  )
                                }
                              >
                                {savingCircle
                                  ? 'Saving...'
                                  : 'Save'}
                              </button>


                              <button
                                type="button"
                                className="cancel-circle"
                                onClick={
                                  cancelCircleEdit
                                }
                              >
                                Cancel
                              </button>

                            </div>

                          </div>

                        )}

                      </article>
                    )
                  }
                )}

              </div>

            )}

          </section>


          {/* ================================================================
              EDIT PROFILE
          ================================================================ */}

          {editing ? (

            <section className="profile-card">

              <h2 className="edit-title">
                Edit profile
              </h2>


              <div className="form-field">

                <label>
                  Display name
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                />

              </div>


              <div className="form-field">

                <label>
                  City *
                </label>

                <input
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                        .toUpperCase()
                    )
                  }
                />

              </div>


              {/* GENDER */}

              <div className="form-field">

                <label>
                  Gender
                </label>


                <div className="option-buttons">

                  {[
                    [
                      'female',
                      'Female',
                    ],

                    [
                      'male',
                      'Male',
                    ],

                    [
                      '',
                      'Prefer not to say',
                    ],
                  ].map(
                    ([
                      value,
                      label,
                    ]) => (

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
                        className={
                          gender ===
                          value
                            ? 'selected'
                            : ''
                        }
                      >
                        {label}
                      </button>

                    )
                  )}

                </div>

              </div>


              {/* INTENTION */}

              <div className="form-field">

                <label>
                  I want to meet people for
                </label>


                <div className="option-buttons">

                  {INTENTION_OPTIONS.map(
                    (option) => (

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
                        className={
                          intentions[0] ===
                          option
                            ? 'selected'
                            : ''
                        }
                      >
                        {option}
                      </button>

                    )
                  )}

                </div>

              </div>


              {/* INTRO */}

              <div className="form-field">

                <label>
                  Introduce yourself
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
                />

                <div className="character-count">
                  {introduction.length}
                  {' / '}
                  {MAX_INTRO_CHARS}
                </div>

              </div>


              <div className="edit-profile-actions">

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

            </section>

          ) : (

            <Button
              variant="secondary"
              onClick={() =>
                setEditing(
                  true
                )
              }
              style={{
                marginBottom:
                  '20px',

                width:
                  '100%',
              }}
            >
              Edit profile
            </Button>

          )}


          {/* ================================================================
              NAV
          ================================================================ */}

          <div className="profile-nav">

            <Link href="/circles">
              Circles
            </Link>

            <Link href="/connections">
              Connections
            </Link>

            <Link href="/messages">
              Messages
            </Link>

          </div>


          {/* SIGN OUT */}

          <button
            onClick={
              handleSignOut
            }
            className="signout-button"
          >
            Sign out
          </button>


          {/* DELETE PROFILE */}

          <button
            onClick={
              handleDeleteProfile
            }
            disabled={
              deleting
            }
            className="delete-profile"
          >
            {deleting
              ? 'Deleting profile...'
              : 'Delete profile'}
          </button>

        </div>

      </main>

      <Footer />


      {/* ==================================================================
          CSS
      ================================================================== */}

      <style jsx global>{`

        .profile-page {
          min-height:
            100vh;

          padding-top:
            110px;

          background:
            #FFF8F2;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          color:
            #2B2725;
        }


        .profile-container {
          max-width:
            580px;

          margin:
            0 auto;

          padding:
            32px 20px 60px;
        }


        /* PROFILE HEADER */

        .profile-header {
          display:
            flex;

          align-items:
            center;

          gap:
            18px;

          margin-bottom:
            18px;
        }


        .profile-photo {
          width:
            82px;

          height:
            82px;

          flex:
            0 0 82px;

          border-radius:
            50%;

          object-fit:
            cover;

          border:
            3px solid #FFFFFF;

          box-shadow:
            0 0 0 1px #E9DDD4;

          background:
            #FFFFFF;
        }


        .profile-header h1 {
          margin:
            0 0 4px;

          font-size:
            1.55rem;

          font-weight:
            700;

          letter-spacing:
            -0.03em;
        }


        .profile-city {
          font-size:
            0.8rem;

          color:
            #817A75;

          letter-spacing:
            0.04em;
        }


        .profile-intention {
          display:
            inline-flex;

          margin-bottom:
            12px;

          padding:
            6px 12px;

          border-radius:
            999px;

          background:
            #FFF0EB;

          color:
            #FF6B5A;

          font-size:
            0.74rem;

          font-weight:
            650;
        }


        .profile-introduction {
          margin:
            0 0 24px;

          max-width:
            500px;

          color:
            #706965;

          font-size:
            0.87rem;

          line-height:
            1.55;
        }


        /* GENERAL CARD */

        .profile-card {
          margin-bottom:
            18px;

          padding:
            21px;

          background:
            #FFFFFF;

          border:
            1px solid #E9DDD4;

          border-radius:
            18px;

          box-sizing:
            border-box;
        }


        .section-label {
          margin:
            0 0 4px;

          font-size:
            0.71rem;

          font-weight:
            700;

          letter-spacing:
            0.07em;

          text-transform:
            uppercase;

          color:
            #9A918B;
        }


        /* CONNECTIONS */

        .connections-top {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            14px;
        }


        .connection-number {
          font-size:
            1.7rem;

          font-weight:
            700;
        }


        .connection-number span {
          font-size:
            0.95rem;

          font-weight:
            500;

          color:
            #A39C97;
        }


        .coral-link {
          color:
            #FF6B5A;

          font-size:
            0.76rem;

          font-weight:
            650;

          text-decoration:
            none;
        }


        .coral-link:hover {
          color:
            #F45542;
        }


        .progress {
          width:
            100%;

          height:
            6px;

          overflow:
            hidden;

          border-radius:
            999px;

          background:
            #F3EEEA;
        }


        .progress-fill {
          height:
            100%;

          border-radius:
            inherit;

          background:
            #FF6B5A;
        }


        .progress-text {
          margin:
            9px 0 0;

          font-size:
            0.74rem;

          line-height:
            1.45;

          color:
            #817A75;
        }


        .create-circle-link {
          display:
            inline-flex;

          margin-top:
            14px;

          padding:
            8px 16px;

          border-radius:
            999px;

          background:
            #FF6B5A;

          color:
            #FFFFFF;

          font-size:
            0.74rem;

          font-weight:
            650;

          text-decoration:
            none;
        }


        /* MY CIRCLES */

        .my-circles-header {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            20px;

          margin-bottom:
            16px;
        }


        .my-circles-header h2 {
          margin:
            0;

          font-size:
            1.04rem;

          letter-spacing:
            -0.02em;
        }


        .circles-empty {
          padding:
            18px 0 4px;

          text-align:
            center;
        }


        .circles-empty p {
          margin:
            0 0 4px;

          font-size:
            0.82rem;

          color:
            #706965;
        }


        .circles-empty span {
          font-size:
            0.72rem;

          color:
            #A39C97;
        }


        .my-circles-list {
          display:
            flex;

          flex-direction:
            column;

          gap:
            10px;
        }


        .my-circle {
          padding:
            14px;

          border:
            1px solid #EEE6E0;

          border-radius:
            13px;

          background:
            #FCFBFA;
        }


        .my-circle-top {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            15px;
        }


        .my-circle-name {
          display:
            inline-block;

          margin-bottom:
            7px;

          color:
            #2B2725;

          font-size:
            0.87rem;

          font-weight:
            700;

          text-decoration:
            none;
        }


        .my-circle-name:hover {
          color:
            #FF6B5A;
        }


        .my-circle-meta {
          display:
            flex;

          align-items:
            center;

          gap:
            8px;

          font-size:
            0.69rem;

          color:
            #817A75;
        }


        .circle-type {
          padding:
            4px 8px;

          border-radius:
            999px;

          font-size:
            0.65rem;

          font-weight:
            700;
        }


        .circle-type-friends {
          background:
            #FFF0EB;

          color:
            #FF604E;
        }


        .circle-type-date {
          background:
            #FFF0F6;

          color:
            #D94D87;
        }


        .circle-type-business {
          background:
            #EDF5FF;

          color:
            #397DC1;
        }


        .view-circle {
          color:
            #FF6B5A;

          font-size:
            0.7rem;

          font-weight:
            650;

          text-decoration:
            none;
        }


        .my-circle-description {
          margin:
            10px 0;

          font-size:
            0.75rem;

          line-height:
            1.5;

          color:
            #706965;
        }


        .circle-management {
          display:
            flex;

          gap:
            8px;

          margin-top:
            11px;

          padding-top:
            10px;

          border-top:
            1px solid #EEE6E0;
        }


        .circle-management button {
          border:
            1px solid #E9DDD4;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            #706965;

          padding:
            6px 12px;

          font-family:
            inherit;

          font-size:
            0.68rem;

          font-weight:
            600;

          cursor:
            pointer;
        }


        .circle-management button:hover {
          color:
            #FF6B5A;

          border-color:
            #F1BEB6;
        }


        .circle-management .archive-button {
          color:
            #B76A62;
        }


        /* CIRCLE EDIT */

        .circle-edit h3 {
          margin:
            0 0 16px;

          font-size:
            0.9rem;
        }


        .circle-edit label,
        .form-field label {
          display:
            block;

          margin:
            12px 0 5px;

          font-size:
            0.73rem;

          font-weight:
            600;

          color:
            #706965;
        }


        .circle-edit input,
        .circle-edit textarea,
        .form-field input,
        .form-field textarea {
          width:
            100%;

          box-sizing:
            border-box;

          padding:
            10px 12px;

          border:
            1px solid #E9DDD4;

          border-radius:
            10px;

          background:
            #FFFFFF;

          outline:
            none;

          font-family:
            inherit;

          color:
            #393532;
        }


        .circle-edit textarea,
        .form-field textarea {
          resize:
            vertical;
        }


        .circle-type-options,
        .option-buttons {
          display:
            flex;

          flex-wrap:
            wrap;

          gap:
            7px;
        }


        .circle-type-options button,
        .option-buttons button {
          padding:
            7px 12px;

          border:
            1px solid #E9DDD4;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            #706965;

          font-family:
            inherit;

          font-size:
            0.71rem;

          font-weight:
            600;

          cursor:
            pointer;
        }


        .circle-type-options button.selected,
        .option-buttons button.selected {
          border-color:
            #FFB8AD;

          background:
            #FFF0EB;

          color:
            #FF604E;
        }


        .character-count {
          margin-top:
            4px;

          text-align:
            right;

          font-size:
            0.65rem;

          color:
            #A39C97;
        }


        .circle-edit-actions,
        .edit-profile-actions {
          display:
            flex;

          gap:
            8px;

          margin-top:
            16px;
        }


        .save-circle,
        .cancel-circle {
          padding:
            8px 17px;

          border-radius:
            999px;

          font-family:
            inherit;

          font-size:
            0.72rem;

          font-weight:
            650;

          cursor:
            pointer;
        }


        .save-circle {
          border:
            1px solid #FF6B5A;

          background:
            #FF6B5A;

          color:
            #FFFFFF;
        }


        .cancel-circle {
          border:
            1px solid #E9DDD4;

          background:
            #FFFFFF;

          color:
            #706965;
        }


        /* PROFILE EDIT */

        .edit-title {
          margin:
            0 0 16px;

          font-size:
            1rem;
        }


        .form-field {
          margin-bottom:
            15px;
        }


        /* NAV */

        .profile-nav {
          display:
            grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap:
            8px;

          margin-bottom:
            24px;
        }


        .profile-nav a {
          padding:
            11px 6px;

          text-align:
            center;

          border:
            1px solid #E9DDD4;

          border-radius:
            11px;

          background:
            #FFFFFF;

          color:
            #2B2725;

          font-size:
            0.76rem;

          font-weight:
            600;

          text-decoration:
            none;
        }


        .profile-nav a:hover {
          color:
            #FF6B5A;

          border-color:
            #F2C4BC;
        }


        /* ACCOUNT */

        .signout-button {
          width:
            100%;

          margin-bottom:
            12px;

          padding:
            11px;

          border:
            1px solid #E9DDD4;

          border-radius:
            11px;

          background:
            transparent;

          color:
            #817A75;

          cursor:
            pointer;
        }


        .delete-profile {
          width:
            100%;

          padding:
            10px;

          border:
            none;

          background:
            transparent;

          color:
            #C76D64;

          cursor:
            pointer;
        }


        /* MOBILE */

        @media (max-width: 640px) {

          .profile-page {
            padding-top:
              120px;
          }


          .profile-container {
            padding:
              24px 14px 45px;
          }


          .profile-card {
            padding:
              17px;
          }


          .profile-photo {
            width:
              68px;

            height:
              68px;

            flex-basis:
              68px;
          }


          .profile-header h1 {
            font-size:
              1.3rem;
          }


          .connections-top {
            align-items:
              flex-start;
          }


          .profile-nav {
            grid-template-columns:
              1fr;
          }


          .my-circle-top {
            gap:
              10px;
          }

        }

      `}</style>

    </>
  )
}