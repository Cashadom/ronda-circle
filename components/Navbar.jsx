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
              href="/circles"
              className="ronda-nav-link"
            >
              Circles
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
            href="/circles"
            className="ronda-mobile-link"
          >
            Circles
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
          max-width: 100%;

          box-sizing: border-box;

          background: rgba(255, 255, 255, 0.92);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          border-bottom:
            1px solid
            rgba(23, 23, 23, 0.04);

          overflow-x: hidden;

          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }


        .ronda-navbar.scrolled {
          background: rgba(255, 255, 255, 0.97);

          border-bottom:
            1px solid
            rgba(23, 23, 23, 0.065);

          box-shadow:
            0 4px 18px
            rgba(32, 24, 20, 0.025);
        }


        .ronda-navbar-inner {
          width: 100%;
          max-width: 1280px;
          min-width: 0;

          height: 90px;

          margin: 0 auto;
          padding: 0 48px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 24px;

          box-sizing: border-box;
        }


        /* ================================================================
           BRAND
        ================================================================= */

        .ronda-brand {
          display: flex;
          align-items: center;

          gap: 16px;

          flex: 1 1 auto;

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
          max-width: 100%;

          object-fit: contain;
        }


        .ronda-slogan {
          min-width: 0;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: 0.88rem;
          font-weight: 500;

          color: #FF6B5A;

          letter-spacing: -0.01em;

          opacity: 0.9;

          border-left:
            1px solid
            #EBE4DF;

          padding-left: 16px;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        /* ================================================================
           DESKTOP NAV
        ================================================================= */

        .ronda-desktop-nav {
          display: flex;
          align-items: center;

          flex-shrink: 0;

          gap: 4px;

          min-width: 0;
        }


        .ronda-nav-link {
          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-size: 0.82rem;
          font-weight: 550;

          color: #44403C;

          text-decoration: none;

          padding: 8px 10px;

          white-space: nowrap;

          border-radius: 999px;

          transition:
            color 0.2s ease,
            background 0.2s ease;
        }


        .ronda-nav-link:hover {
          color: #FF6B5A;

          background: #FFF5F2;
        }


        /* ================================================================
           PROFILE
        ================================================================= */

        .ronda-profile-link {
          display: flex;
          align-items: center;

          flex-shrink: 0;

          margin-left: 8px;

          text-decoration: none;
        }


        .ronda-avatar {
          width: 36px;
          height: 36px;

          flex-shrink: 0;

          box-sizing: border-box;

          border-radius: 50%;

          background-size: cover;
          background-position: center;

          border:
            1.5px solid
            rgba(
              255,
              107,
              90,
              0.22
            );

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .ronda-avatar:hover {
          transform: scale(1.04);

          border-color: #FF6B5A;

          box-shadow:
            0 3px 10px
            rgba(
              255,
              107,
              90,
              0.12
            );
        }


        .ronda-signin {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          background: transparent;

          color: #FF6B5A;

          padding: 7px 20px;

          border-radius: 40px;

          font-family:
            "Manrope",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          font-weight: 600;
          font-size: 0.82rem;

          text-decoration: none;

          border:
            1.5px solid
            rgba(
              255,
              107,
              90,
              0.32
            );

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }


        .ronda-signin:hover {
          background: #FF6B5A;

          color: #FFFFFF;

          border-color: #FF6B5A;

          transform: translateY(-1px);
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

            gap: 18px;
          }


          .ronda-brand {
            gap: 12px;
          }


          .ronda-slogan {
            font-size: 0.76rem;

            padding-left: 12px;
          }


          .ronda-nav-link {
            padding:
              8px 8px;

            font-size:
              0.78rem;
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

            overflow: hidden;
          }


          .ronda-logo-link {
            flex-shrink: 0;
          }


          .ronda-logo {
            height: 46px;

            max-width: 92px;
          }


          .ronda-slogan {
            display: block;

            flex: 1 1 auto;

            min-width: 0;
            max-width: 130px;

            padding-left: 9px;

            border-left:
              1px solid
              #EBE4DF;

            font-size: 0.64rem;
            line-height: 1.25;
            font-weight: 500;

            color: #FF6B5A;

            letter-spacing: -0.01em;

            white-space: normal;

            overflow: hidden;

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

            font-size: 0.72rem;
          }


          /*
            Deuxième ligne :
            CIRCLES / CONNECTIONS / MESSAGES
          */

          .ronda-mobile-nav {
            width: 100%;
            max-width: 100%;

            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            gap: 0;

            padding: 0 12px;

            box-sizing: border-box;

            border-top:
              1px solid
              rgba(
                23,
                23,
                23,
                0.035
              );

            overflow: hidden;
          }


          .ronda-mobile-link {
            flex: 1 1 0;

            min-width: 0;
            max-width: 125px;

            text-align: center;

            font-family:
              "Manrope",
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;

            font-size: 0.74rem;
            font-weight: 550;

            color: #44403C;

            text-decoration: none;

            padding: 8px 4px;

            border-radius: 999px;

            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            transition:
              color 0.2s ease,
              background 0.2s ease;
          }


          .ronda-mobile-link:active {
            color: #FF6B5A;

            background: #FFF5F2;
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

            font-size: 0.59rem;
          }


          .ronda-mobile-profile .ronda-avatar {
            width: 32px;
            height: 32px;
          }


          .ronda-mobile-link {
            font-size: 0.7rem;
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
