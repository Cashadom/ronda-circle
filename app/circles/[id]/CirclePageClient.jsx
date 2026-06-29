'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getCurrentUser, signInWithGoogle } from '@/lib/auth'
import { getCircleType } from '@/lib/circles'
import { getCircle, getCircleMembers, joinCircle, leaveCircle, sendMessage, subscribeMessages, toggleMessageLike, deleteMessage } from '@/lib/circleService'
import { getDisplayName } from '@/lib/users'

const MSG_MAX = 180

function safe(value) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function memberLabel(m) {
  if (!m) return 'Ronda member'
  return m.username || m.name || m.displayName || 'Ronda member'
}

function timeAgo(input) {
  if (!input) return ''
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'yesterday'
  if (diffD < 7) return `${diffD}d ago'
  return date.toLocaleDateString()
}

export default function CirclePageClient() {
  const { id } = useParams()
  const [circle, setCircle] = useState(null)
  const [circleLoading, setCircleLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [creatorName, setCreatorName] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)
  const [sending, setSending] = useState(false)
  const [shared, setShared] = useState(false)

  const currentUid = getCurrentUser()?.uid

  // ─── Circle ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setCircleLoading(true)
    getCircle(id)
      .then(setCircle)
      .catch(() => setCircle(null))
      .finally(() => setCircleLoading(false))
  }, [id])

  // ─── Membres + créateur ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    setMembersLoading(true)
    getCircleMembers(id)
      .then((list) => {
        setMembers(Array.isArray(list) ? list : [])
      })
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false))
  }, [id])

  useEffect(() => {
    if (!circle?.created_by) return
    getDisplayName(circle.created_by)
      .then(setCreatorName)
      .catch(() => setCreatorName(null))
  }, [circle?.created_by])

  // ─── Messages ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return
    return subscribeMessages(id, setMessages)
  }, [id])

  useEffect(() => {
    const user = getCurrentUser()
    if (!user || !members.length) {
      setJoined(false)
      return
    }
    setJoined(members.some((m) => m.uid === user.uid))
  }, [members])

  async function handleJoin() {
    setError('')
    try {
      let user = getCurrentUser()
      if (!user) user = await signInWithGoogle()
      await joinCircle(id, user)
      const refreshed = await getCircleMembers(id)
      setMembers(Array.isArray(refreshed) ? refreshed : [])
      setJoined(true)
    } catch (err) {
      setError(err?.message || 'Unable to join')
    }
  }

  async function handleLeave() {
    setError('')
    if (!confirm('Are you sure you want to leave this circle?')) return

    try {
      const user = getCurrentUser()
      if (!user) {
        await signInWithGoogle()
        return
      }

      await leaveCircle(id, user.uid)
      
      const refreshed = await getCircleMembers(id)
      setMembers(Array.isArray(refreshed) ? refreshed : [])
      setJoined(false)
    } catch (err) {
      setError(err?.message || 'Unable to leave circle')
    }
  }

  async function handleSend(e) {
    e.preventDefault()
    setError('')

    const cleanText = safe(text).trim().slice(0, MSG_MAX)
    if (!cleanText) return

    const user = getCurrentUser()
    if (!user) {
      try {
        await signInWithGoogle()
      } catch (err) {
        setError(err?.message || 'Sign-in required to post')
        return
      }
    }

    const currentUser = getCurrentUser()
    const member = members.find((m) => m.uid === currentUser?.uid)
    const authorName = memberLabel(member) !== 'Ronda member'
      ? memberLabel(member)
      : currentUser?.username || currentUser?.displayName || 'Ronda member'

    setSending(true)
    try {
      await sendMessage(id, {
        text: cleanText,
        author_id: currentUser.uid,
        author_name: authorName,
        reply_to_message: replyTo?.messageId || null,
        reply_to_author: replyTo?.authorName || null,
      })

      setText('')
      setReplyTo(null)
    } catch (err) {
      setError(err?.message || 'Unable to send')
    } finally {
      setSending(false)
    }
  }

  function handleReply(messageId, authorName) {
    setReplyTo({ messageId, authorName })
    document.querySelector('.post-box textarea')?.focus()
  }

  function cancelReply() {
    setReplyTo(null)
  }

  async function handleLike(m) {
    const user = getCurrentUser()
    if (!user) {
      try {
        await signInWithGoogle()
      } catch {
        return
      }
    }
    const uid = getCurrentUser()?.uid
    if (!uid) return

    const alreadyLiked = Array.isArray(m.liked_by) && m.liked_by.includes(uid)

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== m.id) return msg
        const likedBy = Array.isArray(msg.liked_by) ? msg.liked_by : []
        return {
          ...msg,
          liked_by: alreadyLiked ? likedBy.filter((u) => u !== uid) : [...likedBy, uid],
        }
      })
    )

    try {
      await toggleMessageLike(id, m.id, uid)
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === m.id ? m : msg))
      )
      setError(err?.message || 'Unable to like')
    }
  }

  async function handleDelete(messageId) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this message?')) return

    const previous = messages
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))

    try {
      await deleteMessage(id, messageId)
    } catch (err) {
      setMessages(previous)
      setError(err?.message || 'Unable to delete')
    }
  }

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const isMobile = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    try {
      if (isMobile && navigator.share) {
        await navigator.share({ title: circle?.title || 'Ronda Circle', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (_) {
      try {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch (_) {}
    }
  }

  if (circleLoading) {
    return (
      <>
        <Navbar />
        <main className="page-loading"><span>Loading circle...</span></main>
      </>
    )
  }

  if (!circle) {
    return (
      <>
        <Navbar />
        <main className="page-loading"><span>Circle not found.</span></main>
      </>
    )
  }

  const type = getCircleType(circle.type)
  const capacity = Number(circle.capacity || 12)

  const creatorMember = members.find((m) => m.uid === circle.created_by)
  const displayCreator =
    creatorMember?.username ||
    creatorMember?.name ||
    creatorMember?.displayName ||
    creatorName ||
    'Unknown'

  const visibleMembers = members.slice(0, 8)
  const extraMembersCount = Math.max(0, members.length - visibleMembers.length)

  const orderedMessages = [...messages].sort((a, b) => {
    const ta = new Date(a.created_at || a.timestamp || 0).getTime()
    const tb = new Date(b.created_at || b.timestamp || 0).getTime()
    return ta - tb
  })

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          <div className="header">
            <div className="header-left">
              <h1 className="circle-title">{circle.title || 'Untitled circle'}</h1>
              <p className="header-meta">
                {type?.label || 'Circle'}
                {circle.city ? ` · ⚲ ${circle.city}` : ''}
              </p>
              <p className="created-by">Created by {displayCreator}</p>
            </div>
            {!joined ? (
              <button onClick={handleJoin} className="btn-join">Join</button>
            ) : (
              <div className="joined-actions">
                <span className="badge-joined">Joined</span>
                <button onClick={handleLeave} className="btn-leave">Leave</button>
              </div>
            )}
          </div>

          <div className="members-bar">
            <div className="members-list">
              {membersLoading ? (
                <span className="members-empty">Loading members…</span>
              ) : members.length === 0 ? (
                <span className="members-empty">No members yet</span>
              ) : (
                <span className="members-text">
                  <span className="members-label">Members: </span>
                  {visibleMembers.map(memberLabel).join(' • ')}
                  {extraMembersCount > 0 ? ` • +${extraMembersCount}` : ''}
                </span>
              )}
            </div>
            <span className="members-count">{members.length}/{capacity} members</span>
          </div>

          <p className="be-respectful">Be respectful!</p>

          <form className="post-box" onSubmit={handleSend}>
            {replyTo && (
              <div className="reply-indicator">
                <span>Replying to {replyTo.authorName}</span>
                <button type="button" onClick={cancelReply}>✕</button>
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message here (180 characters max)"
              maxLength={MSG_MAX}
              rows={2}
            />
            <div className="post-actions">
              <span className="counter">{MSG_MAX - safe(text).length} left</span>
              <button type="submit" className="btn-post" disabled={sending}>
                {sending ? '…' : 'Post'}
              </button>
            </div>
          </form>

          {error && <p className="error">{error}</p>}

          <div className="messages">
            {orderedMessages.length === 0 && (
              <div className="message-empty">
                <span>No messages yet. Start the conversation.</span>
              </div>
            )}

            {orderedMessages.map((m) => {
              const replyTarget = m.reply_to_author
              const when = timeAgo(m.created_at || m.timestamp)
              const isOwnMessage = m.author_id === currentUid
              const likedBy = Array.isArray(m.liked_by) ? m.liked_by : []
              const isLiked = currentUid ? likedBy.includes(currentUid) : false
              return (
                <div className="message" key={m.id}>
                  {replyTarget && (
                    <p className="replying-to">Replying to {replyTarget}</p>
                  )}
                  <div className="message-head">
                    <span className="author">{safe(m.author_name)}</span>
                    {when && <span className="message-time">{when}</span>}
                  </div>
                  <p className="message-text">{safe(m.text)}</p>
                  <div className="message-actions">
                    <button
                      className={`like-btn${isLiked ? ' liked' : ''}`}
                      onClick={() => handleLike(m)}
                      aria-label="Like"
                    >
                      {isLiked ? '♥' : '♡'}
                      {likedBy.length > 0 && <span className="like-count">{likedBy.length}</span>}
                    </button>
                    {isOwnMessage ? (
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(m.id)}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="reply-btn"
                        onClick={() => handleReply(m.id, safe(m.author_name))}
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ─── BOTTOM LINKS – CORAIL CENTRÉ ─── */}
          <div className="circle-bottom">
            <Link href="/" className="circle-bottom-item">Back home</Link>
            <button onClick={handleShare} className="circle-bottom-item">
              Share group{shared ? ' · Copied!' : ''}
            </button>
            <Link href="/terms" className="circle-bottom-item">Terms</Link>
          </div>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: #fff8f2;
            padding: calc(clamp(58px, 7vw, 70px) + 18px) 16px 28px;
            display: flex;
            justify-content: center;
            font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
            color: #1c1917;
          }

          .page-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff8f2;
            color: #9a918b;
            padding-top: clamp(58px, 7vw, 70px);
          }

          .container {
            max-width: 560px;
            width: 100%;
            background: #ffffff;
            border: 1.5px solid #e8e0d8;
            border-radius: 18px;
            padding: 0 18px 0;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.02);
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 18px 0 12px;
            border-bottom: 1px solid #ede8e2;
            gap: 12px;
          }

          .header-left {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .circle-title {
            font-size: 1.35rem;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #1c1917;
            margin: 0;
          }

          .header-meta {
            font-size: 0.85rem;
            color: #706965;
            margin: 0;
          }

          .created-by {
            font-size: 0.8rem;
            color: #9a918b;
            margin: 2px 0 0;
          }

          .btn-join {
            background: #ff6b5a;
            color: #fff;
            border: none;
            border-radius: 999px;
            padding: 8px 24px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            flex-shrink: 0;
          }

          .btn-join:hover {
            background: #f45542;
          }

          .joined-actions {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .badge-joined {
            font-size: 0.85rem;
            font-weight: 500;
            color: #065f46;
            background: #d1fae5;
            padding: 6px 18px;
            border-radius: 999px;
            flex-shrink: 0;
          }

          .btn-leave {
            background: transparent;
            color: #9A918B;
            border: 1px solid #E9DDD4;
            border-radius: 999px;
            padding: 6px 16px;
            font-size: 0.75rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-leave:hover {
            background: #FEE2E2;
            border-color: #DC2626;
            color: #DC2626;
          }

          .members-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            padding: 10px 0;
            border-bottom: 1px solid #ede8e2;
            flex-wrap: wrap;
          }

          .members-list {
            flex: 1;
            min-width: 0;
          }

          .members-text {
            font-size: 0.85rem;
            color: #1c1917;
            line-height: 1.4;
          }

          .members-label {
            color: #9a918b;
          }

          .members-empty {
            font-size: 0.85rem;
            color: #b5ada6;
          }

          .members-count {
            font-size: 0.8rem;
            color: #706965;
            white-space: nowrap;
          }

          .be-respectful {
            text-align: center;
            font-size: 0.8rem;
            font-weight: 500;
            color: #706965;
            padding: 8px 0 2px;
            margin: 0;
          }

          .post-box {
            margin: 8px 0 12px;
            padding: 6px 0;
            border: none;
            border-bottom: 1.5px dashed rgba(255, 107, 90, 0.3);
            border-radius: 0;
            background: transparent;
          }

          .reply-indicator {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px 12px;
            background: #f5f0eb;
            border-radius: 8px;
            margin-bottom: 10px;
            font-size: 0.8rem;
            color: #706965;
          }

          .reply-indicator button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
            color: #706965;
            padding: 0 4px;
          }

          .post-box textarea {
            width: 100%;
            border: none;
            outline: none;
            resize: none;
            font-family: inherit;
            font-size: 0.92rem;
            color: #1c1917;
            background: transparent;
            min-height: 32px;
            max-height: 90px;
            padding: 6px 0;
          }

          .post-box textarea::placeholder {
            color: #b5ada6;
          }

          .post-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 6px;
          }

          .counter {
            font-size: 0.75rem;
            color: #b5ada6;
          }

          .btn-post {
            background: #ff6b5a;
            color: #fff;
            border: none;
            border-radius: 999px;
            padding: 6px 28px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }

          .btn-post:hover {
            background: #f45542;
          }

          .btn-post:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .error {
            color: #dc2626;
            font-size: 0.85rem;
            padding: 4px 0 4px;
          }

          .messages {
            flex: 1;
            padding: 2px 0 8px;
            min-height: 140px;
            display: flex;
            flex-direction: column;
          }

          .message-empty {
            text-align: center;
            color: #b5ada6;
            font-size: 0.9rem;
            padding: 32px 0;
          }

          .message {
            padding: 8px 0;
            margin: 0;
            border: none;
            border-bottom: 1px solid #eee3dc;
            border-radius: 0;
            background: transparent;
          }

          .message:last-child {
            border-bottom: none;
          }

          .replying-to {
            margin: 0 0 2px;
            font-size: 0.7rem;
            font-weight: 500;
            color: #ff6b5a;
          }

          .message-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 2px;
            gap: 8px;
          }

          .author {
            font-weight: 600;
            font-size: 0.85rem;
            color: #1c1917;
          }

          .message-time {
            font-size: 0.7rem;
            color: #b5ada6;
            white-space: nowrap;
          }

          .message-text {
            margin: 0;
            font-size: 0.9rem;
            line-height: 1.28;
            color: #1c1917;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .message-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 2px;
          }

          .like-btn {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-size: 0.82rem;
            color: #b5ada6;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            margin-right: auto;
            transition: color 0.15s, transform 0.1s;
          }

          .like-btn:active {
            transform: scale(1.15);
          }

          .like-btn.liked {
            color: #ff6b5a;
          }

          .like-count {
            font-size: 0.7rem;
            color: #9a918b;
          }

          .reply-btn {
            font-size: 0.72rem;
            color: #9a918b;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s;
          }

          .reply-btn:hover {
            color: #ff6b5a;
          }

          .delete-btn {
            font-size: 0.72rem;
            color: #b5ada6;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            transition: color 0.2s;
          }

          .delete-btn:hover {
            color: #dc2626;
          }

          /* ─── BOTTOM LINKS – CORAIL CENTRÉ ─── */
          .circle-bottom {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0;
            padding: 20px 0;
            border-top: 1px solid #ede8e2;
          }

          .circle-bottom-item {
            appearance: none;
            -webkit-appearance: none;
            display: inline-flex;
            align-items: center;
            background: transparent !important;
            border: none !important;
            color: #FF6B5A !important;
            text-decoration: none !important;
            font-family: inherit;
            font-size: 0.83rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            cursor: pointer;
            padding: 0;
          }

          .circle-bottom-item:hover {
            color: #F45542 !important;
          }

          .circle-bottom-item:not(:last-child)::after {
            content: "•";
            color: #D9CFC7;
            margin: 0 18px;
          }

          @media (max-width: 640px) {
            .page {
              padding: calc(clamp(58px, 7vw, 70px) + 10px) 10px 18px;
            }

            .container {
              padding: 0 12px 0;
              border-radius: 14px;
            }

            .header {
              padding: 14px 0 10px;
            }

            .circle-title {
              font-size: 1.15rem;
            }

            .btn-join {
              padding: 6px 18px;
              font-size: 0.8rem;
            }

            .post-box textarea {
              font-size: 0.88rem;
              min-height: 30px;
            }

            .message-text {
              font-size: 0.86rem;
            }

            .circle-bottom {
              justify-content: center;
              flex-wrap: wrap;
              gap: 8px;
            }

            .circle-bottom-item:not(:last-child)::after {
              margin: 0 10px;
            }
          }

          @media (max-width: 400px) {
            .container {
              padding: 0 10px 0;
            }

            .circle-title {
              font-size: 1.05rem;
            }

            .header {
              flex-wrap: wrap;
              gap: 6px;
            }
          }
        `}</style>
      </main>
    </>
  )
}