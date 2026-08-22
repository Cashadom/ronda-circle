'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, getCurrentUser } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (user) router.push('/profile')
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      router.push('/profile')
    } catch (err) {
      setError('Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <img src="/point.png" alt="" className="login-icon" />
            <h1>Ronda Club</h1>
            <p className="login-subtitle">find your people, simply connect.</p>
          </div>

          <div className="login-body">
            <div className="login-features">
              <div className="feature-item">
                <span className="feature-dot">⚲</span>
                <span>Meet people who are open to connecting in your city</span>
              </div>

              <div className="feature-item">
                <span className="feature-dot">⚲</span>
                <span>Connect, chat and see who is actually ready to meet</span>
              </div>

              <div className="feature-item">
                <span className="feature-dot">⚲</span>
                <span>Join Circles around friendship, dating or business</span>
              </div>
            </div>

            <p className="connect-first">Don&apos;t just RSVP. Connect first.</p>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn-google"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" fill="#EA4335"/>
                <path d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" fill="#4285F4"/>
                <path d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" fill="#FBBC05"/>
                <path d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" fill="#34A853"/>
              </svg>

              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>

            {error && <p className="error">{error}</p>}

            <p className="login-terms">
              By signing in, you agree to our{' '}
              <a href="/terms">Terms</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        .login-page {
          min-height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FFF8F2;
          padding: 40px 20px;
        }

        .login-card {
          background: #FFFFFF;
          border: 1.5px solid #E9DDD4;
          border-radius: 28px;
          padding: 48px 40px 40px;
          max-width: 420px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
          animation: fadeUp 0.6s ease-out;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-icon {
          width: 110px;
          height: auto;
          display: block;
          margin: 0 auto 12px;
        }

        .login-header h1 {
          font-family: 'Inter', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #2B2725;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          color: #706965;
          margin: 0;
          font-weight: 400;
        }

        .login-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 16px 0 0;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #2B2725;
          padding: 6px 0;
        }

        .feature-dot {
          font-size: 1.1rem;
          color: #FF6B5A;
          width: 24px;
          text-align: center;
          flex-shrink: 0;
        }

        .connect-first {
          margin: -4px 0 0;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          line-height: 1.4;
          font-weight: 700;
          color: #FF6B5A;
        }

        .btn-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 20px;
          background: #FFFFFF;
          border: 1.5px solid #E9DDD4;
          border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          color: #2B2725;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .btn-google:hover:not(:disabled) {
          background: #FFF8F2;
          border-color: #FF6B5A;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 107, 90, 0.12);
        }

        .btn-google:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: #DC2626;
          text-align: center;
          margin: 0;
        }

        .login-terms {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #9A918B;
          text-align: center;
          margin: 0;
        }

        .login-terms a {
          color: #FF6B5A;
          text-decoration: none;
        }

        .login-terms a:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 20px 28px;
            border-radius: 20px;
          }

          .login-icon {
            width: 80px;
          }

          .login-header h1 {
            font-size: 1.4rem;
          }

          .login-subtitle {
            font-size: 0.85rem;
          }

          .feature-item {
            font-size: 0.8rem;
          }

          .connect-first {
            font-size: 0.85rem;
          }

          .btn-google {
            font-size: 0.85rem;
            padding: 12px 16px;
          }
        }
      `}</style>
    </>
  )
}