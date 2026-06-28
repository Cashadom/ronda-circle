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
import { DEFAULT_CAPACITY, CAPACITY_MAX, CAPACITY_MIN } from './circles'
import { getUserProfile, getDisplayName } from './users'

// ─── listOpenCircles ───────────────────────────────────────────────────────
export async function listOpenCircles(max = 24) {
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

// ─── getCircle ────────────────────────────────────────────────────────────
export async function getCircle(circleId) {
  if (!circleId) return null

  const snap = await getDoc(doc(db, 'circles', circleId))

  return snap.exists()
    ? { id: snap.id, ...snap.data() }
    : null
}

// ─── getUserCircles ──────────────────────────────────────────────────────
export async function getUserCircles(uid) {
  if (!uid) return []

  const userCirclesRef = collection(db, 'users', uid, 'circles')
  const snapshot = await getDocs(userCirclesRef)

  if (snapshot.empty) return []

  const circles = []
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const circleId = docSnap.id
    const circle = await getCircle(circleId)
    if (circle) {
      circles.push({
        ...circle,
        joined_at: data.joined_at,
        role: data.role,
      })
    }
  }

  return circles.sort((a, b) => {
    const ta = a.joined_at?.toDate?.() || new Date(0)
    const tb = b.joined_at?.toDate?.() || new Date(0)
    return tb - ta
  })
}

// ─── createCircle ─────────────────────────────────────────────────────────
export async function createCircle(payload, user) {
  if (!user?.uid) throw new Error('Sign in required')

  const capacity = Math.min(
    CAPACITY_MAX,
    Math.max(CAPACITY_MIN, Number(payload.capacity || DEFAULT_CAPACITY))
  )

  const city = (payload.city || '').trim()

  const displayName = await getDisplayName(user.uid)

  const data = {
    title: payload.title.trim(),
    description: (payload.description || '').trim(),
    type: payload.type,
    city,
    is_remote: !city,
    capacity,
    members_count: 1,
    status: 'open',
    created_by: user.uid,
    created_by_name: displayName,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  }

  const ref = await addDoc(collection(db, 'circles'), data)

  await setDoc(doc(db, 'circles', ref.id, 'members', user.uid), {
    user_id: user.uid,
    name: displayName,
    photo_url: user.photoURL || '',
    role: 'owner',
    joined_at: serverTimestamp(),
  })

  await setDoc(doc(db, 'users', user.uid, 'circles', ref.id), {
    circle_id: ref.id,
    role: 'owner',
    joined_at: serverTimestamp(),
  })

  return ref.id
}

// ─── joinCircle ───────────────────────────────────────────────────────────
export async function joinCircle(circleId, user) {
  if (!user?.uid || !circleId) throw new Error('Sign in required')

  const circle = await getCircle(circleId)
  if (!circle) throw new Error('Circle not found')

  const memberRef = doc(db, 'circles', circleId, 'members', user.uid)
  const memberSnap = await getDoc(memberRef)

  if (memberSnap.exists()) {
    return
  }

  const displayName = await getDisplayName(user.uid)

  await setDoc(memberRef, {
    user_id: user.uid,
    name: displayName,
    photo_url: user.photoURL || '',
    role: 'member',
    joined_at: serverTimestamp(),
  })

  await setDoc(doc(db, 'users', user.uid, 'circles', circleId), {
    circle_id: circleId,
    role: 'member',
    joined_at: serverTimestamp(),
  })

  await updateDoc(doc(db, 'circles', circleId), {
    members_count: Math.min(
      Number(circle.members_count || 0) + 1,
      Number(circle.capacity || DEFAULT_CAPACITY)
    ),
    updated_at: serverTimestamp(),
  })
}

// ─── getCircleMembers ─────────────────────────────────────────────────────
export async function getCircleMembers(circleId) {
  if (!circleId) return []

  const membersRef = collection(db, 'circles', circleId, 'members')
  const snapshot = await getDocs(membersRef)

  if (snapshot.empty) return []

  const members = []
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    const userId = data.user_id
    if (!userId) continue

    const profile = await getUserProfile(userId)
    const displayName = await getDisplayName(userId)

    if (profile) {
      members.push({
        uid: userId,
        name: displayName,
        photo_url: profile.photo_url || data.photo_url || '',
        role: data.role || 'member',
        joined_at: data.joined_at,
      })
    } else {
      members.push({
        uid: userId,
        name: data.name || displayName || 'Anonymous',
        photo_url: data.photo_url || '',
        role: data.role || 'member',
        joined_at: data.joined_at,
      })
    }
  }

  return members.sort((a, b) => {
    const ta = a.joined_at?.toDate?.() || new Date(0)
    const tb = b.joined_at?.toDate?.() || new Date(0)
    return ta - tb
  })
}

// ─── subscribeMessages ────────────────────────────────────────────────────
export function subscribeMessages(circleId, callback) {
  const q = query(
    collection(db, 'circles', circleId, 'messages'),
    orderBy('created_at', 'asc'),
    limit(100)
  )

  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }))
    )
  })
}

// ─── sendMessage ──────────────────────────────────────────────────────────
export async function sendMessage(circleId, payload) {
  if (!circleId) throw new Error('Missing circle id')
  if (!payload?.text?.trim()) throw new Error('Message text is required')

  const messageData = {
    text: payload.text.trim().slice(0, 280),
    author_id: payload.author_id || null,
    author_name: payload.author_name || 'Anonymous',
    author_photo: payload.photo_url || '',
    reply_to_message: payload.reply_to_message || null,
    reply_to_author: payload.reply_to_author || null,
    created_at: serverTimestamp(),
  }

  await addDoc(collection(db, 'circles', circleId, 'messages'), messageData)
}

// ─── toggleMessageLike ────────────────────────────────────────────────────
export async function toggleMessageLike(circleId, messageId, userId) {
  if (!circleId || !messageId || !userId) {
    throw new Error('Missing required parameters')
  }

  const messageRef = doc(db, 'circles', circleId, 'messages', messageId)
  const messageSnap = await getDoc(messageRef)

  if (!messageSnap.exists()) {
    throw new Error('Message not found')
  }

  const data = messageSnap.data()
  const likedBy = Array.isArray(data.liked_by) ? data.liked_by : []
  const isLiked = likedBy.includes(userId)

  if (isLiked) {
    await updateDoc(messageRef, {
      liked_by: likedBy.filter((id) => id !== userId),
    })
  } else {
    await updateDoc(messageRef, {
      liked_by: [...likedBy, userId],
    })
  }
}

// ─── deleteMessage ────────────────────────────────────────────────────────
export async function deleteMessage(circleId, messageId) {
  if (!circleId || !messageId) {
    throw new Error('Missing required parameters')
  }

  await deleteDoc(doc(db, 'circles', circleId, 'messages', messageId))
}