import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'

import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

import { db, storage } from './firebase'
import { getCurrentWeekKey } from './week'

function cleanDisplayName(user) {
  return (
    user?.username ||
    user?.pseudo ||
    user?.name ||
    user?.email?.split('@')[0]?.slice(0, 5) ||
    'Ronda'
  )
}

export async function uploadWeeklyMoment(circleId, user, file) {
  if (!circleId || !user?.uid) throw new Error('Missing required params')

  const weekKey = getCurrentWeekKey()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  const already = await hasPostedThisWeek(circleId, user.uid)
  if (already) {
    throw new Error('You already shared your weekly moment this week.')
  }

  const path = `weekly-moments/${circleId}/${user.uid}/${weekKey}.jpg`
  const fileRef = storageRef(storage, path)

  await uploadBytes(fileRef, file)
  const photoURL = await getDownloadURL(fileRef)

  const momentRef = doc(collection(db, 'circles', circleId, 'weeklyMoments'))

  await setDoc(momentRef, {
    uid: user.uid,
    displayName: cleanDisplayName(user),
    photoURL,
    weekKey,
    createdAt: serverTimestamp(),
    expiresAt,
  })

  return { id: momentRef.id, photoURL }
}

export async function hasPostedThisWeek(circleId, userId) {
  const weekKey = getCurrentWeekKey()

  const q = query(
    collection(db, 'circles', circleId, 'weeklyMoments'),
    where('uid', '==', userId),
    where('weekKey', '==', weekKey),
    limit(1)
  )

  const snap = await getDocs(q)
  return !snap.empty
}

export async function getWeeklyMoments(circleId, limitCount = 20) {
  const q = query(
    collection(db, 'circles', circleId, 'weeklyMoments'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )

  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteWeeklyMoment(circleId, momentId, userId) {
  const momentRef = doc(db, 'circles', circleId, 'weeklyMoments', momentId)
  const snap = await getDoc(momentRef)

  if (!snap.exists()) throw new Error('Moment not found')
  if (snap.data().uid !== userId) throw new Error('Not authorized')

  const weekKey = snap.data().weekKey
  const path = `weekly-moments/${circleId}/${userId}/${weekKey}.jpg`

  try {
    await deleteObject(storageRef(storage, path))
  } catch (_) {}

  await deleteDoc(momentRef)
}

export async function cleanExpiredMoments(circleId) {
  const now = new Date()

  const q = query(
    collection(db, 'circles', circleId, 'weeklyMoments'),
    where('expiresAt', '<', now)
  )

  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}