import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from './firebase'
import { createUserProfile, getUserProfile } from './users'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user = result.user

  const existing = await getUserProfile(user.uid)
  if (!existing) {
    await createUserProfile({
      id: user.uid,
      name: user.displayName || 'Ronda User',
      email: user.email,
      photo_url: user.photoURL || '',
      trust_score: 0,
      city: '',
      events_attended: 0,
      events_hosted: 0,
      created_at: new Date(),
    })
  }

  return user
}

export async function signOut() {
  await firebaseSignOut(auth)
}

export function getCurrentUser() {
  return auth.currentUser
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}
