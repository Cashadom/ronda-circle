'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { onAuthChange } from '@/lib/auth'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const unsub = onAuthChange(setUser)

    const onScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      unsub()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <>
      <nav
        className={`ronda-navbar ${scrolled ? 'scrolled' : ''}`}
      >
        <div className="ronda-navbar-inner">

          {/* LOGO + SLOGAN */}

          <div className="ronda-brand">

            <Link
              href="/"
              className="ronda-logo-link"
            >
              <img
                src="/logo.png"
                alt="Ronda"
                className="ronda-logo"
              />
            </Link>

            <span className="ronda-slogan">
              find your people, simply connect.
            </span>

          </div>


          {/* DESKTOP NAV */}

          <div className="ronda-desktop-nav">

            <Link
              href="/members"
              className="ronda-nav-link"
            >
              People
            </Link>

            {user && (
              <>
                <Link
                  href="/connections"
                  className="ronda-nav-link"
                >
                  Connections
                </Link>

                <Link
                  href="/messages"
                  className="ronda-nav-link"
                >
                  Messages
                </Link>
              </>
            )}

            <UserAction user={user} />

          </div>


          {/* MOBILE PROFILE */}

          <div className="ronda-mobile-profile">
            <UserAction user={user} />
          </div>

        </div>


        {/* MOBILE NAVIGATION */}

        <div className="ronda-mobile-nav">

          <Link
            href="/members"
            className="ronda-mobile-link"
          >
            People
          </Link>

          {user && (
            <>
              <Link
                href="/connections"
                className="ronda-mobile-link"
              >
                Connections
              </Link>

              <Link
                href="/messages"
                className="ronda-mobile-link"
              >
                Messages
              </Link>
            </>
          )}

        </div>

      </nav>


      <style jsx global>{`

        /* ================================================================
           NAVBAR
        ================================================================= */

        .ronda-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;

          z-index: 200;

          width: 100%;

          background: rgba(255, 255, 255, 0.88);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          border-bottom: 1px solid rgba(0, 0, 0, 0.03);

          transition:
            background 0.3s ease,
            border-color 0.3s ease;

          box-sizing: border-box;
        }


        .ronda-navbar.scrolled {
          background: rgba(255, 255, 255, 0.96);

          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }


        .ronda-navbar-inner {
          width: 100%;
          max-width: 1280px;

          height: 90px;

          margin: 0 auto;
          padding: 0 48px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          box-sizing: border-box;
        }


        /* ================================================================
           BRAND
        ================================================================= */

        .ronda-brand {
          display: flex;
          align-items: center;

          gap: 16px;

          min-width: 0;
        }


        .ronda-logo-link {
          display: flex;
          align-items: center;

          flex-shrink: 0;

          text-decoration: none;
        }


        .ronda-logo {
          display: block;

          height: 76px;
          width: auto;

          object-fit: contain;
        }


        .ronda-slogan {
          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size: 0.9rem;
          font-weight: 450;

          color: var(--coral);

          letter-spacing: -0.01em;

          opacity: 0.85;

          border-left: 1px solid #E9DDD4;

          padding-left: 16px;

          white-space: nowrap;
        }


        /* ================================================================
           DESKTOP NAV
        ================================================================= */

        .ronda-desktop-nav {
          display: flex;
          align-items: center;

          gap: 4px;
        }


        .ronda-nav-link {
          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-size: 0.84rem;
          font-weight: 500;

          color: #44403C;

          text-decoration: none;

          padding: 8px 10px;

          white-space: nowrap;

          transition: color 0.2s ease;
        }


        .ronda-nav-link:hover {
          color: var(--coral);
        }


        /* ================================================================
           PROFILE
        ================================================================= */

        .ronda-profile-link {
          display: flex;
          align-items: center;

          margin-left: 8px;

          text-decoration: none;
        }


        .ronda-avatar {
          width: 36px;
          height: 36px;

          border-radius: 50%;

          background-size: cover;
          background-position: center;

          border: 1.5px solid rgba(255, 107, 81, 0.2);

          transition:
            transform 0.2s ease,
            border-color 0.2s ease;
        }


        .ronda-avatar:hover {
          transform: scale(1.04);

          border-color: var(--coral);
        }


        .ronda-signin {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          background: transparent;

          color: var(--coral);

          padding: 7px 20px;

          border-radius: 40px;

          font-family:
            "Avenir Next",
            "Segoe UI",
            Inter,
            system-ui,
            sans-serif;

          font-weight: 500;
          font-size: 0.84rem;

          text-decoration: none;

          border: 1.5px solid var(--coral-border);

          transition: all 0.2s ease;
        }


        .ronda-signin:hover {
          background: var(--coral);

          color: #FFFFFF;

          border-color: var(--coral);
        }


        /* ================================================================
           MOBILE ELEMENTS HIDDEN ON DESKTOP
        ================================================================= */

        .ronda-mobile-profile,
        .ronda-mobile-nav {
          display: none;
        }


        /* ================================================================
           TABLET
        ================================================================= */

        @media (max-width: 900px) {

          .ronda-navbar-inner {
            padding: 0 24px;
          }


          .ronda-slogan {
            font-size: 0.78rem;
          }

        }


        /* ================================================================
           MOBILE
        ================================================================= */

        @media (max-width: 640px) {

          /*
            Première ligne :
            LOGO | SLOGAN | AVATAR
          */

          .ronda-navbar-inner {
            height: 68px;

            padding: 0 14px;

            gap: 10px;
          }


          .ronda-brand {
            flex: 1;

            min-width: 0;

            gap: 9px;
          }


          .ronda-logo {
            height: 46px;

            max-width: 92px;
          }


          .ronda-slogan {
            display: block;

            min-width: 0;
            max-width: 130px;

            padding-left: 9px;

            border-left: 1px solid #E9DDD4;

            font-size: 0.66rem;
            line-height: 1.25;
            font-weight: 500;

            color: var(--coral);

            letter-spacing: -0.01em;

            white-space: normal;

            opacity: 0.9;
          }


          /* DESKTOP NAV OFF */

          .ronda-desktop-nav {
            display: none;
          }


          /* AVATAR MOBILE */

          .ronda-mobile-profile {
            display: flex;
            align-items: center;

            flex-shrink: 0;
          }


          .ronda-mobile-profile .ronda-profile-link {
            margin-left: 0;
          }


          .ronda-mobile-profile .ronda-avatar {
            width: 34px;
            height: 34px;
          }


          .ronda-mobile-profile .ronda-signin {
            padding: 6px 12px;

            font-size: 0.74rem;
          }


          /*
            Deuxième ligne :
            PEOPLE / CONNECTIONS / MESSAGES
          */

          .ronda-mobile-nav {
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 0;

            padding: 0 12px;

            border-top: 1px solid rgba(0, 0, 0, 0.035);

            box-sizing: border-box;
          }


          .ronda-mobile-link {
            flex: 1;

            max-width: 125px;

            text-align: center;

            font-family:
              "Avenir Next",
              "Segoe UI",
              Inter,
              system-ui,
              sans-serif;

            font-size: 0.76rem;
            font-weight: 500;

            color: #44403C;

            text-decoration: none;

            padding: 8px 4px;

            white-space: nowrap;
          }


          .ronda-mobile-link:active {
            color: var(--coral);
          }

        }


        /* ================================================================
           VERY SMALL MOBILE
        ================================================================= */

        @media (max-width: 380px) {

          .ronda-navbar-inner {
            padding: 0 10px;

            gap: 7px;
          }


          .ronda-logo {
            height: 42px;

            max-width: 82px;
          }


          .ronda-brand {
            gap: 7px;
          }


          .ronda-slogan {
            max-width: 112px;

            padding-left: 7px;

            font-size: 0.61rem;
          }


          .ronda-mobile-profile .ronda-avatar {
            width: 32px;
            height: 32px;
          }


          .ronda-mobile-link {
            font-size: 0.72rem;
          }

        }

      `}</style>
    </>
  )
}


/* ======================================================================
   USER ACTION
====================================================================== */

function UserAction({ user }) {

  if (user) {

    const avatar =
      user.photoURL ||
      '/point.png'

    return (
      <Link
        href="/profile"
        className="ronda-profile-link"
        aria-label="Profile"
      >
        <div
          className="ronda-avatar"
          style={{
            backgroundImage: `url("${avatar}")`,
          }}
        />
      </Link>
    )
  }


  return (
    <Link
      href="/login"
      className="ronda-signin"
    >
      Sign in
    </Link>
  )
}