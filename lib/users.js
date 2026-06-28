import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export async function createUserProfile(userData) {
  if (!userData?.id) throw new Error('Missing user id')
  const ref = doc(db, 'users', userData.id)
  const now = serverTimestamp()

  // Générer un username si non fourni
  const username = userData.username || userData.name?.toLowerCase().replace(/\s/g, '') || `user_${userData.id.slice(0, 8)}`

  await setDoc(ref, {
    name: userData.name || '',
    username: username,
    email: userData.email || '',
    photo_url: userData.photo_url || '',
    city: userData.city || '',
    bio: userData.bio || '',
    trust_score: 0,
    circles_joined: 0,
    circles_created: 0,
    messages_count: 0,
    created_at: now,
    updated_at: now,
  }, { merge: true })
}

export async function getUserProfile(uid) {
  if (!uid) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function updateUserProfile(uid, updates) {
  if (!uid) throw new Error('Missing user id')
  const ref = doc(db, 'users', uid)
  await updateDoc(ref, {
    ...updates,
    updated_at: serverTimestamp(),
  })
}

export async function deleteUserProfile(uid) {
  if (!uid) throw new Error('Missing user id')
  await deleteDoc(doc(db, 'users', uid))
}

export async function getUserStats(uid) {
  const profile = await getUserProfile(uid)
  if (!profile) {
    return { trust_score: 0, circles_joined: 0, circles_created: 0, messages_count: 0 }
  }
  return {
    trust_score: profile.trust_score || 0,
    circles_joined: profile.circles_joined || 0,
    circles_created: profile.circles_created || 0,
    messages_count: profile.messages_count || 0,
  }
}

export async function getDisplayName(uid) {
  const profile = await getUserProfile(uid)
  if (!profile) return 'Ronda member'
  return profile.username || profile.name || profile.displayName || 'Ronda member'
}