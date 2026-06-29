'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'
import { listOpenCircles } from '@/lib/circleService'
import { getCircleType } from '@/lib/circles'

export default function CirclesPage() {
  const [circles, setCircles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listOpenCircles(50)
      .then((data) => {
        setCircles(Array.isArray(data) ? data : [])
      })
      .catch(() => setCircles([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="page">
          <div className="container">
            <p className="loading">Loading circles...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="container">
          {/* Header */}
          <div className="header">
            <h1 className="page-title">Existing circles</h1>
            <Link href="/create-circle" className="btn-create">
              Create a circle
            </Link>
          </div>

          {/* Tableau */}
          {circles.length === 0 ? (
            <div className="empty-state">
              <p>No circles yet.</p>
              <Link href="/create-circle" className="btn-create-empty">
                Create a circle →
              </Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="circles-table">
                <thead>
                  <tr>
                    <th className="col-group">Group</th>
                    <th className="col-topic">Topic</th>
                    <th className="col-city">City</th>
                    <th className="col-members">Members</th>
                    <th className="col-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {circles.map((circle) => {
                    const type = getCircleType(circle.type)
                    const count = Number(circle.members_count || 0)
                    const capacity = Number(circle.capacity || 12)
                    const isFull = count >= capacity

                    return (
                      <tr key={circle.id} className="table-row">
                        <td className="col-group">
                          <img src="/point.png" alt="" className="point-icon" />
                          <Link href={`/circles/${circle.id}`} className="group-link">
                            {circle.title || 'Untitled'}
                          </Link>
                        </td>
                        <td className="col-topic">
                          <span className="topic-badge">{type?.label || 'Circle'}</span>
                        </td>
                        <td className="col-city">
                          <span className="city">⚲ {circle.city || 'Remote'}</span>
                        </td>
                        <td className="col-members">
                          <span className="members-count">{count} / {capacity}</span>
                        </td>
                        <td className="col-action">
                          {isFull ? (
                            <span className="btn-full">Full</span>
                          ) : (
                            <Link href={`/circles/${circle.id}`} className="btn-join">
                              Join
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #FFF8F2;
          padding: calc(clamp(62px, 8vw, 76px) + 44px) 5% 44px;
          display: flex;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          color: #2B2725;
        }

        .container {
          max-width: 1120px;
          width: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2B2725;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .btn-create {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #FF6B5A;
          color: #FFFFFF;
          border: none;
          border-radius: 999px;
          padding: 11px 26px;
          font-size: 0.88rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.15s ease;
          cursor: pointer;
          flex-shrink: 0;
          line-height: 1;
        }

        .btn-create:hover {
          background: #F45542;
          transform: translateY(-1px);
        }

        .btn-create:active {
          transform: translateY(0);
        }

        .loading {
          text-align: center;
          color: #9A918B;
          padding: 60px 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 0;
          background: #FFFFFF;
          border: 1px solid #E9DDD4;
          border-radius: 16px;
        }

        .empty-state p {
          font-size: 1rem;
          color: #706965;
          margin-bottom: 16px;
        }

        .btn-create-empty {
          display: inline-block;
          background: #FF6B5A;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 12px 32px;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
        }

        .btn-create-empty:hover {
          background: #F45542;
        }

        .table-wrap {
          background: #FFFFFF;
          border: 1px solid #E9DDD4;
          border-radius: 16px;
          overflow: hidden;
        }

        .circles-table {
          width: 100%;
          border-collapse: collapse;
        }

        .circles-table th {
          text-align: left;
          padding: 16px 18px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9A918B;
          background: transparent;
          border-bottom: 1px solid #E9DDD4;
        }

        .circles-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #F0EBE6;
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .circles-table tr:last-child td {
          border-bottom: none;
        }

        .table-row {
          transition: background 0.15s ease;
        }

        .table-row:hover {
          background: #FCF9F7;
        }

        .col-group {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 200px;
          min-height: 70px;
        }

        .point-icon {
          width: 56px;
          height: auto;
          flex-shrink: 0;
          display: block;
        }

        .group-link {
          color: #2B2725;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .group-link:hover {
          color: #FF6B5A;
        }

        .topic-badge {
          display: inline-block;
          background: #FFF0EB;
          color: #FF6B5A;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .city {
          color: #706965;
          font-size: 0.85rem;
        }

        .members-count {
          font-size: 0.85rem;
          color: #2B2725;
        }

        .btn-join {
          display: inline-block;
          background: #FF6B5A;
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 6px 18px;
          font-size: 0.8rem;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
          cursor: pointer;
        }

        .btn-join:hover {
          background: #F45542;
        }

        .btn-full {
          display: inline-block;
          background: #f0ebe6;
          color: #9A918B;
          border: none;
          border-radius: 999px;
          padding: 6px 18px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: default;
          pointer-events: none;
        }

        @media (max-width: 820px) {
          .page {
            padding: calc(clamp(62px, 8vw, 76px) + 28px) 4% 28px;
          }

          .page-title {
            font-size: 1.4rem;
          }

          .header {
            align-items: flex-start;
            flex-direction: column;
          }

          .circles-table th,
          .circles-table td {
            padding: 12px 14px;
            font-size: 0.85rem;
          }

          .col-group {
            min-height: 56px;
            gap: 12px;
          }

          .point-icon {
            width: 42px;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: calc(clamp(62px, 8vw, 76px) + 20px) 4% 20px;
          }

          .page-title {
            font-size: 1.25rem;
          }

          .btn-create {
            width: 100%;
            justify-content: center;
          }

          .header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .circles-table th,
          .circles-table td {
            padding: 10px 10px;
            font-size: 0.8rem;
          }

          .col-group {
            min-width: 120px;
            gap: 10px;
            min-height: 48px;
          }

          .point-icon {
            width: 34px;
          }

          .col-topic,
          .col-city {
            display: none;
          }

          .btn-join,
          .btn-full {
            padding: 5px 12px;
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .page-title {
            font-size: 1.15rem;
          }

          .col-group {
            min-height: 42px;
          }

          .point-icon {
            width: 28px;
          }

          .group-link {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  )
}
