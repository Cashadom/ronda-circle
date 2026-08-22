import { NextResponse } from 'next/server'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }

  return getFirestore()
}

function toDate(value) {
  if (!value) return null

  if (typeof value.toDate === 'function') {
    return value.toDate()
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? null
    : date
}

function isThisMonth(value) {
  const date = toDate(value)

  if (!date) return false

  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  )
}

export async function GET() {
  try {
    const db = getAdminDb()

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    const usersSnapshot = await db
      .collection('users')
      .get()

    const totalUsers = usersSnapshot.size

    let newUsersMonth = 0

    usersSnapshot.forEach((doc) => {
      const data = doc.data()

      const createdAt =
        data.created_at ||
        data.createdAt ||
        data.created

      if (isThisMonth(createdAt)) {
        newUsersMonth++
      }
    })

    // --------------------------------------------------
    // CONNECTIONS
    // --------------------------------------------------

    const connectionsSnapshot = await db
      .collection('connections')
      .get()

    let connectionsMade = 0
    let connectionsMonth = 0

    connectionsSnapshot.forEach((doc) => {
      const data = doc.data()

      if (data.status === 'connected') {
        connectionsMade++

        const connectedAt =
          data.connected_at ||
          data.connectedAt ||
          data.updated_at ||
          data.updatedAt

        if (isThisMonth(connectedAt)) {
          connectionsMonth++
        }
      }
    })

    // --------------------------------------------------
    // MESSAGES
    //
    // collectionGroup('messages') counts messages stored
    // in subcollections such as:
    // connections/{connectionId}/messages/{messageId}
    // --------------------------------------------------

    const messagesSnapshot = await db
      .collectionGroup('messages')
      .get()

    let messagesExchanged = 0
    let messagesMonth = 0

    messagesSnapshot.forEach((doc) => {
      /*
       * We only want messages whose parent structure is:
       *
       * connections/{connectionId}/messages/{messageId}
       *
       * This prevents Circle messages from being included.
       */

      const parentCollection = doc.ref.parent
      const connectionDocument = parentCollection.parent

      if (
        !connectionDocument ||
        connectionDocument.parent.id !== 'connections'
      ) {
        return
      }

      messagesExchanged++

      const data = doc.data()

      const createdAt =
        data.created_at ||
        data.createdAt ||
        data.timestamp ||
        data.sent_at ||
        data.sentAt

      if (isThisMonth(createdAt)) {
        messagesMonth++
      }
    })

    // --------------------------------------------------
    // PUBLIC NUMBERS ONLY
    // --------------------------------------------------

    return NextResponse.json({
      total_users: totalUsers,
      new_users_month: newUsersMonth,

      connections_made: connectionsMade,
      connections_month: connectionsMonth,

      messages_exchanged: messagesExchanged,
      messages_month: messagesMonth,
    })
  } catch (error) {
    console.error('Stats API error:', error)

    return NextResponse.json(
      {
        error: 'Unable to calculate statistics.',
      },
      {
        status: 500,
      }
    )
  }
}