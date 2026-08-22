'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'


function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(
    Number(value || 0)
  )
}


export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  async function loadStats() {
    setLoading(true)
    setError('')

    try {
      const response =
        await fetch(
          '/api/stats',
          {
            method: 'GET',
            cache: 'no-store',
          }
        )

      if (!response.ok) {
        throw new Error(
          'Unable to load statistics.'
        )
      }

      const data =
        await response.json()

      setStats(data)

    } catch (err) {
      console.error(
        'Error loading Ronda statistics:',
        err
      )

      setStats(null)

      setError(
        'Statistics are temporarily unavailable.'
      )

    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    loadStats()
  }, [])


  return (
    <>
      <Navbar />

      <main className="dashboard-page">

        <div className="dashboard-container">


          {/* BACK */}

          <Link
            href="/"
            className="dashboard-back"
          >
            ← Back to home
          </Link>


          {/* HERO */}

          <section className="dashboard-hero">

            <p className="dashboard-eyebrow">
              RONDA IN REAL TIME
            </p>

            <h1>
              People are connecting.
            </h1>

            <p className="dashboard-intro">
              A public overview of how people
              are joining, connecting and talking
              across the Ronda community.
            </p>

          </section>


          {/* LOADING */}

          {loading && (
            <div className="dashboard-state">
              Loading Ronda activity...
            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-state">

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadStats}
                className="dashboard-refresh"
              >
                Try again
              </button>

            </div>
          )}


          {/* STATS */}

          {!loading && stats && (
            <>

              <section className="dashboard-grid">


                <article className="dashboard-card">

                  <strong className="dashboard-value">
                    {formatNumber(
                      stats.total_users
                    )}
                  </strong>

                  <span className="dashboard-label">
                    Ronda members
                  </span>

                  <p>
                    People who have created
                    a Ronda profile.
                  </p>

                </article>


                <article className="dashboard-card">

                  <strong className="dashboard-value">
                    +
                    {formatNumber(
                      stats.new_users_month
                    )}
                  </strong>

                  <span className="dashboard-label">
                    New this month
                  </span>

                  <p>
                    New members who joined
                    Ronda this month.
                  </p>

                </article>


                <article className="dashboard-card">

                  <strong className="dashboard-value">
                    {formatNumber(
                      stats.connections_made
                    )}
                  </strong>

                  <span className="dashboard-label">
                    Connections made
                  </span>

                  <p>
                    Connection requests
                    accepted between members.
                  </p>

                </article>


                <article className="dashboard-card">

                  <strong className="dashboard-value">
                    {formatNumber(
                      stats.messages_exchanged
                    )}
                  </strong>

                  <span className="dashboard-label">
                    Messages exchanged
                  </span>

                  <p>
                    Private messages exchanged
                    after members connected.
                  </p>

                </article>

              </section>


              {/* MONTHLY ACTIVITY */}

              <section className="dashboard-live">

                <div>

                  <p className="dashboard-eyebrow">
                    COMMUNITY ACTIVITY
                  </p>

                  <h2>
                    What happened this month.
                  </h2>

                  <p>
                    Ronda helps people discover
                    each other through Circles.
                    Members choose who they want
                    to connect with and conversations
                    remain private.
                  </p>

                </div>


                <div className="dashboard-live-stats">

                  <div>

                    <span>
                      This month
                    </span>

                    <strong>
                      {formatNumber(
                        stats.connections_month
                      )}
                    </strong>

                    <small>
                      connections
                    </small>

                  </div>


                  <div>

                    <span>
                      This month
                    </span>

                    <strong>
                      {formatNumber(
                        stats.messages_month
                      )}
                    </strong>

                    <small>
                      messages
                    </small>

                  </div>

                </div>

              </section>


              {/* PRIVACY */}

              <section className="dashboard-privacy">

                <span className="privacy-dot" />

                <p>
                  Only aggregated statistics are shown.
                  Names, user IDs and private conversations
                  are never displayed here.
                </p>

              </section>

            </>
          )}

        </div>

      </main>

      <Footer />


      <style jsx global>{`

        .dashboard-page {
          min-height: 100vh;

          padding:
            135px 20px 70px;

          box-sizing: border-box;

          background: #FF6B5A;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          color: #FFFFFF;
        }


        .dashboard-container {
          width: 100%;

          max-width: 1050px;

          margin: 0 auto;
        }


        /* BACK */

        .dashboard-back {
          display: inline-flex;

          align-items: center;

          margin-bottom: 42px;

          color:
            rgba(
              255,
              255,
              255,
              0.88
            );

          font-size: 0.8rem;

          font-weight: 700;

          text-decoration: none;

          transition:
            transform 0.2s ease,
            color 0.2s ease;
        }


        .dashboard-back:hover {
          color: #FFFFFF;

          transform:
            translateX(-3px);
        }


        /* HERO */

        .dashboard-hero {
          max-width: 760px;

          margin-bottom: 42px;
        }


        .dashboard-eyebrow {
          margin:
            0 0 10px;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          font-size: 0.68rem;

          font-weight: 800;

          letter-spacing:
            0.14em;

          text-transform:
            uppercase;
        }


        .dashboard-hero h1 {
          margin:
            0 0 14px;

          color: #FFFFFF;

          font-size:
            clamp(
              2.5rem,
              7vw,
              4.4rem
            );

          line-height: 0.98;

          font-weight: 800;

          letter-spacing:
            -0.055em;
        }


        .dashboard-intro {
          max-width: 650px;

          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.82
            );

          font-size: 1rem;

          line-height: 1.65;
        }


        /* STATE */

        .dashboard-state {
          padding:
            50px 20px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.35
            );

          border-radius: 22px;

          background:
            rgba(
              255,
              255,
              255,
              0.12
            );

          color: #FFFFFF;

          text-align: center;
        }


        .dashboard-state p {
          margin: 0;
        }


        .dashboard-refresh {
          margin-top: 16px;

          padding:
            10px 20px;

          border: none;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            #FF6B5A;

          font: inherit;

          font-weight: 700;

          cursor: pointer;
        }


        /* GRID */

        .dashboard-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 12px;

          margin-bottom:
            16px;
        }


        .dashboard-card {
          min-height:
            200px;

          padding:
            24px;

          box-sizing:
            border-box;

          display: flex;

          flex-direction:
            column;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.32
            );

          border-radius:
            22px;

          background:
            rgba(
              255,
              255,
              255,
              0.13
            );

          color:
            #FFFFFF;

          box-shadow:
            0 16px 40px
            rgba(
              120,
              35,
              25,
              0.08
            );

          backdrop-filter:
            blur(8px);
        }


        .dashboard-card:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.18
            );
        }


        .dashboard-value {
          display: block;

          margin-bottom:
            8px;

          color:
            #FFFFFF;

          font-size:
            clamp(
              2.4rem,
              5vw,
              3.2rem
            );

          line-height: 1;

          font-weight: 800;

          letter-spacing:
            -0.055em;
        }


        .dashboard-label {
          display: block;

          color:
            #FFFFFF;

          font-size:
            0.8rem;

          font-weight:
            750;
        }


        .dashboard-card p {
          margin:
            auto 0 0;

          padding-top:
            24px;

          color:
            rgba(
              255,
              255,
              255,
              0.7
            );

          font-size:
            0.72rem;

          line-height:
            1.5;
        }


        /* COMMUNITY */

        .dashboard-live {
          display: grid;

          grid-template-columns:
            minmax(
              0,
              1.4fr
            )
            minmax(
              280px,
              0.6fr
            );

          gap: 35px;

          align-items:
            center;

          margin-top:
            16px;

          padding:
            30px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.32
            );

          border-radius:
            22px;

          background:
            rgba(
              255,
              255,
              255,
              0.13
            );
        }


        .dashboard-live h2 {
          max-width:
            560px;

          margin:
            0 0 10px;

          color:
            #FFFFFF;

          font-size:
            clamp(
              1.4rem,
              3vw,
              1.9rem
            );

          line-height:
            1.15;

          letter-spacing:
            -0.035em;
        }


        .dashboard-live p:not(.dashboard-eyebrow) {
          max-width:
            600px;

          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.74
            );

          font-size:
            0.85rem;

          line-height:
            1.65;
        }


        .dashboard-live-stats {
          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            10px;
        }


        .dashboard-live-stats > div {
          padding:
            18px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.22
            );

          border-radius:
            16px;

          background:
            rgba(
              255,
              255,
              255,
              0.11
            );

          text-align:
            center;
        }


        .dashboard-live-stats span {
          display: block;

          margin-bottom:
            6px;

          color:
            rgba(
              255,
              255,
              255,
              0.62
            );

          font-size:
            0.62rem;

          text-transform:
            uppercase;

          letter-spacing:
            0.08em;
        }


        .dashboard-live-stats strong {
          display: block;

          color:
            #FFFFFF;

          font-size:
            1.9rem;

          line-height: 1;
        }


        .dashboard-live-stats small {
          display: block;

          margin-top:
            5px;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          font-size:
            0.68rem;
        }


        /* PRIVACY */

        .dashboard-privacy {
          display: flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            9px;

          margin-top:
            22px;

          padding:
            12px 15px;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

          font-size:
            0.72rem;

          text-align:
            center;
        }


        .dashboard-privacy p {
          margin: 0;
        }


        .privacy-dot {
          width:
            7px;

          height:
            7px;

          flex-shrink:
            0;

          border-radius:
            50%;

          background:
            #FFFFFF;
        }


        /* TABLET */

        @media (
          max-width: 850px
        ) {

          .dashboard-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }


          .dashboard-live {
            grid-template-columns:
              1fr;
          }

        }


        /* MOBILE */

        @media (
          max-width: 520px
        ) {

          .dashboard-page {
            padding:
              115px 12px 45px;
          }


          .dashboard-back {
            margin-bottom:
              30px;
          }


          .dashboard-hero {
            margin-bottom:
              28px;
          }


          .dashboard-hero h1 {
            font-size:
              2.7rem;
          }


          .dashboard-grid {
            grid-template-columns:
              1fr 1fr;

            gap:
              8px;
          }


          .dashboard-card {
            min-height:
              175px;

            padding:
              16px;

            border-radius:
              17px;
          }


          .dashboard-value {
            font-size:
              2.15rem;
          }


          .dashboard-card p {
            padding-top:
              14px;

            font-size:
              0.65rem;
          }


          .dashboard-label {
            font-size:
              0.7rem;
          }


          .dashboard-live {
            padding:
              20px 16px;

            border-radius:
              17px;
          }


          .dashboard-live-stats {
            gap:
              7px;
          }


          .dashboard-live-stats > div {
            padding:
              14px 8px;
          }

        }

      `}</style>
    </>
  )
}