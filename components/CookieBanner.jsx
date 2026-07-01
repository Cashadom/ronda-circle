'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');

    if (!consent) {
      setShow(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  }

  if (!show) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="cookie-content">
          <img
            src="/cookie.png"
            alt="Cookie"
            className="cookie-icon"
          />

          <div className="cookie-text">
            <strong>Cookies</strong>

            <p>
              We use essential cookies to keep you signed in and improve your
              experience on Ronda Club.
            </p>

            <Link href="/terms">
              Learn more
            </Link>
          </div>
        </div>

        <button onClick={acceptCookies}>
          Accept
        </button>
      </div>

      <style jsx>{`
        .cookie-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;

          width: 420px;
          max-width: calc(100vw - 32px);

          background: white;
          border: 1px solid #E9DDD4;
          border-radius: 20px;

          padding: 18px;

          display: flex;
          justify-content: space-between;
          gap: 18px;

          box-shadow: 0 20px 50px rgba(0,0,0,.08);
        }

        .cookie-content{
          display:flex;
          gap:14px;
          flex:1;
        }

        .cookie-icon{
          width:46px;
          height:46px;
          object-fit:contain;
        }

        .cookie-text strong{
          display:block;
          margin-bottom:6px;
          color:#2B2725;
          font-size:.95rem;
        }

        .cookie-text p{
          margin:0;
          color:#706965;
          font-size:.83rem;
          line-height:1.45;
        }

        .cookie-text a{
          display:inline-block;
          margin-top:8px;
          color:#FF6B5A;
          text-decoration:none;
          font-size:.8rem;
          font-weight:600;
        }

        button{
          border:none;
          background:#FF6B5A;
          color:white;

          border-radius:999px;

          padding:10px 22px;

          font-weight:600;

          cursor:pointer;
        }

        button:hover{
          background:#F45542;
        }

        @media(max-width:640px){

          .cookie-banner{
            left:16px;
            right:16px;
            bottom:16px;
            width:auto;
            flex-direction:column;
          }

          button{
            width:100%;
          }
        }
      `}</style>
    </>
  );
}