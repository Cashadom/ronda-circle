import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase'


function normalizeCity(city = '') {
  return String(city)
    .trim()
    .toUpperCase()
}


function normalizeIntroduction(text = '') {
  const words = String(text)
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return words
    .slice(0, 180)
    .join(' ')
}


function normalizeIntentions(intentions) {
  if (!Array.isArray(intentions)) {
    return []
  }

  return intentions
    .map(item => String(item).trim())
    .filter(Boolean)
    .slice(0, 5)
}


export async function createUserProfile(userData) {
  if (!userData?.id) {
    throw new Error('Missing user id')
  }

  const ref = doc(
    db,
    'users',
    userData.id
  )

  const now = serverTimestamp()

  const username =
    userData.username ||
    userData.name
      ?.toLowerCase()
      .replace(/\s/g, '') ||
    `user_${userData.id.slice(0, 8)}`

  const photo =
    userData.photoURL ||
    userData.photo_url ||
    ''

  await setDoc(
    ref,
    {
      name:
        userData.name ||
        '',

      username,

      email:
        userData.email ||
        '',

      photo_url:
        photo,

      photoURL:
        photo,

      city:
        normalizeCity(
          userData.city
        ),

      gender:
        userData.gender ||
        '',

      intentions:
        normalizeIntentions(
          userData.intentions
        ),

      introduction:
        normalizeIntroduction(
          userData.introduction ||
          userData.bio ||
          ''
        ),

      /*
       * Ancien champ conservé
       * pour compatibilité avec
       * les anciens comptes.
       */
      bio:
        normalizeIntroduction(
          userData.introduction ||
          userData.bio ||
          ''
        ),

      /*
       * Anciens champs conservés
       * temporairement pour éviter
       * de casser d'autres parties
       * de l'application.
       */
      trust_score:
        userData.trust_score ||
        0,

      circles_joined:
        userData.circles_joined ||
        0,

      circles_created:
        userData.circles_created ||
        0,

      messages_count:
        userData.messages_count ||
        0,

      connections_count:
        userData.connections_count ||
        0,

      created_at:
        now,

      updated_at:
        now,
    },
    {
      merge: true
    }
  )
}


export async function getUserProfile(uid) {
  if (!uid) {
    return null
  }

  const snap =
    await getDoc(
      doc(
        db,
        'users',
        uid
      )
    )

  if (!snap.exists()) {
    return null
  }

  const data = snap.data()

  return {
    id: snap.id,

    ...data,

    city:
      normalizeCity(
        data.city
      ),

    intentions:
      normalizeIntentions(
        data.intentions
      ),

    introduction:
      normalizeIntroduction(
        data.introduction ||
        data.bio ||
        ''
      ),
  }
}


export async function updateUserProfile(
  uid,
  updates
) {
  if (!uid) {
    throw new Error(
      'Missing user id'
    )
  }

  const ref =
    doc(
      db,
      'users',
      uid
    )

  const cleanUpdates = {
    ...updates
  }


  /*
   * Ville toujours enregistrée
   * en MAJUSCULES.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      'city'
    )
  ) {
    cleanUpdates.city =
      normalizeCity(
        updates.city
      )
  }


  /*
   * Maximum 5 intentions.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      'intentions'
    )
  ) {
    cleanUpdates.intentions =
      normalizeIntentions(
        updates.intentions
      )
  }


  /*
   * Introduction limitée
   * à 180 mots.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      'introduction'
    )
  ) {
    const introduction =
      normalizeIntroduction(
        updates.introduction
      )

    cleanUpdates.introduction =
      introduction

    /*
     * On conserve bio pendant
     * la migration pour ne pas
     * casser les anciens écrans.
     */
    cleanUpdates.bio =
      introduction
  }


  /*
   * Synchroniser les deux anciens
   * noms de champ photo.
   */
  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      'photoURL'
    )
  ) {
    cleanUpdates.photo_url =
      updates.photoURL
  }

  if (
    Object.prototype.hasOwnProperty.call(
      updates,
      'photo_url'
    )
  ) {
    cleanUpdates.photoURL =
      updates.photo_url
  }


  await updateDoc(
    ref,
    {
      ...cleanUpdates,

      updated_at:
        serverTimestamp(),
    }
  )
}


export async function deleteUserProfile(
  uid
) {
  if (!uid) {
    throw new Error(
      'Missing user id'
    )
  }

  await deleteDoc(
    doc(
      db,
      'users',
      uid
    )
  )
}


/*
 * Ancienne fonction conservée
 * pour compatibilité.
 */
export async function getUserStats(
  uid
) {
  const profile =
    await getUserProfile(uid)

  if (!profile) {
    return {
      trust_score: 0,
      circles_joined: 0,
      circles_created: 0,
      messages_count: 0,
      connections_count: 0,
    }
  }

  return {
    trust_score:
      profile.trust_score ||
      0,

    circles_joined:
      profile.circles_joined ||
      0,

    circles_created:
      profile.circles_created ||
      0,

    messages_count:
      profile.messages_count ||
      0,

    connections_count:
      profile.connections_count ||
      0,
  }
}


export async function getDisplayName(
  uid
) {
  const profile =
    await getUserProfile(uid)

  if (!profile) {
    return 'Ronda member'
  }

  return (
    profile.name ||
    profile.username ||
    profile.displayName ||
    'Ronda member'
  )
}