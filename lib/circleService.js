import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from './firebase'
import {
  getUserProfile,
  getDisplayName,
} from './users'


// ─────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────

function normalizeCircleType(value = '') {
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


function buildCircleTitle(city, type) {
  const cleanCity =
    String(city || '')
      .trim()
      .toUpperCase()

  const cleanType =
    normalizeCircleType(type)

  if (!cleanCity) {
    return `Ronda Club · ${cleanType}`
  }

  return `Ronda Club · ${cleanCity} · ${cleanType}`
}


// ─────────────────────────────────────────────────────────────────────────
// LIST CIRCLES
// ─────────────────────────────────────────────────────────────────────────

export async function listOpenCircles(max = 100) {
  const q = query(
    collection(db, 'circles'),
    orderBy('created_at', 'desc'),
    limit(max)
  )

  const snap = await getDocs(q)

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }))
}


// ─────────────────────────────────────────────────────────────────────────
// GET CIRCLE
// ─────────────────────────────────────────────────────────────────────────

export async function getCircle(circleId) {
  if (!circleId) return null

  const snap = await getDoc(
    doc(
      db,
      'circles',
      circleId
    )
  )

  return snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null
}


// ─────────────────────────────────────────────────────────────────────────
// USER CIRCLES
// ─────────────────────────────────────────────────────────────────────────

export async function getUserCircles(uid) {
  if (!uid) return []

  const userCirclesRef =
    collection(
      db,
      'users',
      uid,
      'circles'
    )

  const snapshot =
    await getDocs(
      userCirclesRef
    )

  if (snapshot.empty) {
    return []
  }

  const circles = []

  for (
    const docSnap
    of snapshot.docs
  ) {
    const data =
      docSnap.data()

    const circleId =
      docSnap.id

    const circle =
      await getCircle(
        circleId
      )

    if (circle) {
      circles.push({
        ...circle,

        joined_at:
          data.joined_at,

        role:
          data.role,
      })
    }
  }

  return circles.sort(
    (a, b) => {
      const ta =
        a.joined_at
          ?.toDate?.() ||
        new Date(0)

      const tb =
        b.joined_at
          ?.toDate?.() ||
        new Date(0)

      return tb - ta
    }
  )
}


// ─────────────────────────────────────────────────────────────────────────
// CREATE CIRCLE
// NO MEMBER LIMIT
// ─────────────────────────────────────────────────────────────────────────

export async function createCircle(
  payload,
  user
) {
  if (!user?.uid) {
    throw new Error(
      'Sign in required'
    )
  }

  const city =
    String(
      payload.city ||
      ''
    ).trim()

  if (!city) {
    throw new Error(
      'City is required'
    )
  }

  const type =
    normalizeCircleType(
      payload.type
    )

  const description =
    String(
      payload.description ||
      ''
    ).trim()

  const displayName =
    await getDisplayName(
      user.uid
    )

  /*
   * Title is now generated automatically.
   * Users no longer choose the Circle name.
   */

  const title =
    buildCircleTitle(
      city,
      type
    )

  const data = {
    title,

    description,

    type,

    city,

    is_remote:
      false,

    /*
     * NO CAPACITY.
     * A Circle can have 5, 500
     * or 50,000 members.
     */

    members_count:
      1,

    status:
      'open',

    created_by:
      user.uid,

    created_by_name:
      displayName,

    created_at:
      serverTimestamp(),

    updated_at:
      serverTimestamp(),
  }

  const ref =
    await addDoc(
      collection(
        db,
        'circles'
      ),
      data
    )


  /*
   * Creator automatically
   * becomes first member.
   */

  await setDoc(
    doc(
      db,
      'circles',
      ref.id,
      'members',
      user.uid
    ),
    {
      user_id:
        user.uid,

      name:
        displayName,

      photo_url:
        user.photoURL ||
        '',

      role:
        'owner',

      joined_at:
        serverTimestamp(),
    }
  )


  /*
   * Keep legacy user/circles structure
   * so old pages and URLs continue working.
   */

  await setDoc(
    doc(
      db,
      'users',
      user.uid,
      'circles',
      ref.id
    ),
    {
      circle_id:
        ref.id,

      role:
        'owner',

      joined_at:
        serverTimestamp(),
    }
  )

  return ref.id
}


// ─────────────────────────────────────────────────────────────────────────
// JOIN CIRCLE
// UNLIMITED MEMBERS
// ─────────────────────────────────────────────────────────────────────────

export async function joinCircle(
  circleId,
  user
) {
  if (
    !user?.uid ||
    !circleId
  ) {
    throw new Error(
      'Sign in required'
    )
  }

  const circle =
    await getCircle(
      circleId
    )

  if (!circle) {
    throw new Error(
      'Circle not found'
    )
  }

  const memberRef =
    doc(
      db,
      'circles',
      circleId,
      'members',
      user.uid
    )

  const memberSnap =
    await getDoc(
      memberRef
    )

  /*
   * Already a member:
   * do nothing.
   */

  if (memberSnap.exists()) {
    return
  }

  const displayName =
    await getDisplayName(
      user.uid
    )


  /*
   * Add user to Circle.
   */

  await setDoc(
    memberRef,
    {
      user_id:
        user.uid,

      name:
        displayName,

      photo_url:
        user.photoURL ||
        '',

      role:
        'member',

      joined_at:
        serverTimestamp(),
    }
  )


  /*
   * Keep user -> circles reference.
   */

  await setDoc(
    doc(
      db,
      'users',
      user.uid,
      'circles',
      circleId
    ),
    {
      circle_id:
        circleId,

      role:
        'member',

      joined_at:
        serverTimestamp(),
    }
  )


  /*
   * IMPORTANT:
   *
   * Old version:
   *
   * Math.min(
   *   members_count + 1,
   *   capacity
   * )
   *
   * New version:
   * unlimited growth.
   */

  await updateDoc(
    doc(
      db,
      'circles',
      circleId
    ),
    {
      members_count:
        Number(
          circle.members_count ||
          0
        ) + 1,

      updated_at:
        serverTimestamp(),
    }
  )
}


// ─────────────────────────────────────────────────────────────────────────
// LEAVE CIRCLE
// ─────────────────────────────────────────────────────────────────────────

export async function leaveCircle(
  circleId,
  userId
) {
  if (
    !circleId ||
    !userId
  ) {
    throw new Error(
      'Missing required parameters'
    )
  }

  const circle =
    await getCircle(
      circleId
    )

  if (!circle) {
    throw new Error(
      'Circle not found'
    )
  }

  const memberRef =
    doc(
      db,
      'circles',
      circleId,
      'members',
      userId
    )

  const memberSnap =
    await getDoc(
      memberRef
    )

  if (!memberSnap.exists()) {
    return
  }


  await deleteDoc(
    memberRef
  )


  await deleteDoc(
    doc(
      db,
      'users',
      userId,
      'circles',
      circleId
    )
  )


  await updateDoc(
    doc(
      db,
      'circles',
      circleId
    ),
    {
      members_count:
        Math.max(
          0,
          Number(
            circle.members_count ||
            0
          ) - 1
        ),

      updated_at:
        serverTimestamp(),
    }
  )
}


// ─────────────────────────────────────────────────────────────────────────
// GET CIRCLE MEMBERS
// ─────────────────────────────────────────────────────────────────────────

export async function getCircleMembers(
  circleId
) {
  if (!circleId) {
    return []
  }

  const membersRef =
    collection(
      db,
      'circles',
      circleId,
      'members'
    )

  const snapshot =
    await getDocs(
      membersRef
    )

  if (snapshot.empty) {
    return []
  }

  const members = []


  for (
    const docSnap
    of snapshot.docs
  ) {
    const data =
      docSnap.data()

    const userId =
      data.user_id ||
      docSnap.id

    if (!userId) {
      continue
    }

    try {
      const profile =
        await getUserProfile(
          userId
        )

      const displayName =
        await getDisplayName(
          userId
        )


      if (profile) {
        members.push({
          uid:
            userId,

          id:
            userId,

          name:
            displayName ||
            profile.displayName ||
            profile.name ||
            profile.username ||
            data.name ||
            'Ronda member',

          displayName:
            profile.displayName ||
            displayName ||
            data.name ||
            '',

          photo_url:
            profile.photo_url ||
            profile.photoURL ||
            data.photo_url ||
            '',

          photoURL:
            profile.photoURL ||
            profile.photo_url ||
            data.photo_url ||
            '',

          city:
            profile.city ||
            '',

          gender:
            profile.gender ||
            '',

          intentions:
            Array.isArray(
              profile.intentions
            )
              ? profile.intentions
              : [],

          interests:
            Array.isArray(
              profile.interests
            )
              ? profile.interests
              : [],

          introduction:
            profile.introduction ||
            profile.bio ||
            '',

          role:
            data.role ||
            'member',

          joined_at:
            data.joined_at,
        })
      } else {
        /*
         * Legacy users without
         * complete profile.
         */

        members.push({
          uid:
            userId,

          id:
            userId,

          name:
            data.name ||
            displayName ||
            'Ronda member',

          displayName:
            data.name ||
            displayName ||
            '',

          photo_url:
            data.photo_url ||
            '',

          photoURL:
            data.photo_url ||
            '',

          city:
            '',

          gender:
            '',

          intentions:
            [],

          interests:
            [],

          introduction:
            '',

          role:
            data.role ||
            'member',

          joined_at:
            data.joined_at,
        })
      }

    } catch (err) {
      console.error(
        'Error loading Circle member:',
        userId,
        err
      )

      /*
       * Don't kill the whole Circle
       * because one old profile
       * is malformed.
       */

      members.push({
        uid:
          userId,

        id:
          userId,

        name:
          data.name ||
          'Ronda member',

        displayName:
          data.name ||
          '',

        photo_url:
          data.photo_url ||
          '',

        photoURL:
          data.photo_url ||
          '',

        city:
          '',

        gender:
          '',

        intentions:
          [],

        interests:
          [],

        introduction:
          '',

        role:
          data.role ||
          'member',

        joined_at:
          data.joined_at,
      })
    }
  }


  /*
   * Oldest members first.
   */

  return members.sort(
    (a, b) => {
      const ta =
        a.joined_at
          ?.toDate?.() ||
        new Date(0)

      const tb =
        b.joined_at
          ?.toDate?.() ||
        new Date(0)

      return ta - tb
    }
  )
}


// ─────────────────────────────────────────────────────────────────────────
// LEGACY CIRCLE MESSAGES
//
// Kept temporarily so old code / old URLs do not break.
// The new Circle UI does NOT use collective chat.
// ─────────────────────────────────────────────────────────────────────────

export function subscribeMessages(
  circleId,
  callback
) {
  const q =
    query(
      collection(
        db,
        'circles',
        circleId,
        'messages'
      ),

      orderBy(
        'created_at',
        'asc'
      ),

      limit(100)
    )

  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map(
          (d) => ({
            id:
              d.id,

            ...d.data(),
          })
        )
      )
    }
  )
}


// ─────────────────────────────────────────────────────────────────────────
// LEGACY SEND MESSAGE
// ─────────────────────────────────────────────────────────────────────────

export async function sendMessage(
  circleId,
  payload
) {
  if (!circleId) {
    throw new Error(
      'Missing circle id'
    )
  }

  if (!payload?.text?.trim()) {
    throw new Error(
      'Message text is required'
    )
  }

  const messageData = {
    text:
      payload.text
        .trim()
        .slice(
          0,
          280
        ),

    author_id:
      payload.author_id ||
      null,

    author_name:
      payload.author_name ||
      'Anonymous',

    author_photo:
      payload.photo_url ||
      '',

    reply_to_message:
      payload.reply_to_message ||
      null,

    reply_to_author:
      payload.reply_to_author ||
      null,

    created_at:
      serverTimestamp(),
  }

  await addDoc(
    collection(
      db,
      'circles',
      circleId,
      'messages'
    ),
    messageData
  )
}


// ─────────────────────────────────────────────────────────────────────────
// LEGACY MESSAGE LIKE
// ─────────────────────────────────────────────────────────────────────────

export async function toggleMessageLike(
  circleId,
  messageId,
  userId
) {
  if (
    !circleId ||
    !messageId ||
    !userId
  ) {
    throw new Error(
      'Missing required parameters'
    )
  }

  const messageRef =
    doc(
      db,
      'circles',
      circleId,
      'messages',
      messageId
    )

  const messageSnap =
    await getDoc(
      messageRef
    )

  if (!messageSnap.exists()) {
    throw new Error(
      'Message not found'
    )
  }

  const data =
    messageSnap.data()

  const likedBy =
    Array.isArray(
      data.liked_by
    )
      ? data.liked_by
      : []

  const isLiked =
    likedBy.includes(
      userId
    )

  if (isLiked) {
    await updateDoc(
      messageRef,
      {
        liked_by:
          likedBy.filter(
            (id) =>
              id !== userId
          ),
      }
    )
  } else {
    await updateDoc(
      messageRef,
      {
        liked_by: [
          ...likedBy,
          userId,
        ],
      }
    )
  }
}


// ─────────────────────────────────────────────────────────────────────────
// LEGACY DELETE MESSAGE
// ─────────────────────────────────────────────────────────────────────────

export async function deleteMessage(
  circleId,
  messageId
) {
  if (
    !circleId ||
    !messageId
  ) {
    throw new Error(
      'Missing required parameters'
    )
  }

  await deleteDoc(
    doc(
      db,
      'circles',
      circleId,
      'messages',
      messageId
    )
  )
}


// ─────────────────────────────────────────────────────────────────────────
// LEGACY WEEKLY MOMENTS
//
// Kept only so old imports do not suddenly break.
// New Circle UI no longer exposes Weekly Moments.
// ─────────────────────────────────────────────────────────────────────────

export async function getCircleLatestMoments(
  circleId,
  limitCount = 6
) {
  if (!circleId) {
    return []
  }

  const q =
    query(
      collection(
        db,
        'circles',
        circleId,
        'weeklyMoments'
      ),

      orderBy(
        'createdAt',
        'desc'
      ),

      limit(
        limitCount
      )
    )

  const snap =
    await getDocs(q)

  return snap.docs.map(
    (d) => ({
      id:
        d.id,

      ...d.data(),
    })
  )
}