'use client'

import Navbar from '@/components/Navbar'
import Footer from '@/components/common/Footer'

export default function DeleteAccountPage() {
  return (
    <>
      <Navbar />

      <main className="delete-page">
        <div className="delete-card">
          <div className="eyebrow">RONDA CLUB</div>

          <h1>Delete your account</h1>

          <p className="intro">
            You can permanently delete your Ronda Club account directly
            from your profile.
          </p>

          <div className="steps">
            <div className="step">
              <span>1</span>
              <p>Sign in to your Ronda Club account.</p>
            </div>

            <div className="step">
              <span>2</span>
              <p>Open your Profile.</p>
            </div>

            <div className="step">
              <span>3</span>
              <p>Scroll to the bottom of the page and select <strong>Delete profile</strong>.</p>
            </div>

            <div className="step">
              <span>4</span>
              <p>Confirm the deletion when prompted.</p>
            </div>
          </div>

          <a href="/profile" className="profile-button">
            Go to my profile
          </a>

          <div className="info">
            <h2>What happens when you delete your account?</h2>

            <p>
              Your Ronda Club profile and account will be deleted and you
              will no longer be able to access the account.
            </p>

            <p>
              If you cannot access your account or need assistance with an
              account deletion request, contact us at:
            </p>

            <a
              href="mailto:cyril.ragonet@gmail.com"
              className="email"
            >
              cyril.ragonet@gmail.com
            </a>
          </div>

          <p className="note">
            For security reasons, you may be asked to sign in again before
            confirming account deletion.
          </p>
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .delete-page {
          min-height: calc(100vh - 140px);
          background: #fff8f2;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding: 70px 20px 90px;
        }

        .delete-card {
          width: 100%;
          max-width: 720px;
          background: #ffffff;
          border: 1.5px solid #e9ddd4;
          border-radius: 28px;
          padding: 52px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        }

        .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ff6b5a;
          margin-bottom: 15px;
        }

        h1 {
          font-family: 'Inter', sans-serif;
          font-size: 2.5rem;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #2b2725;
          margin: 0 0 18px;
        }

        .intro {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          line-height: 1.7;
          color: #706965;
          margin: 0 0 36px;
          max-width: 580px;
        }

        .steps {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 32px;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 15px 18px;
          border: 1px solid #eee3dc;
          border-radius: 16px;
          background: #fffdfa;
        }

        .step span {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #ff6b5a;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .step p {
          margin: 0;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          line-height: 1.5;
          color: #2b2725;
        }

        .profile-button {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 13px 25px;
          background: #ff6b5a;
          color: #ffffff;
          border-radius: 30px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .profile-button:hover {
          transform: translateY(-1px);
          opacity: 0.9;
        }

        .info {
          margin-top: 42px;
          padding-top: 32px;
          border-top: 1px solid #eee3dc;
        }

        .info h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1.15rem;
          color: #2b2725;
          margin: 0 0 14px;
        }

        .info p {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          line-height: 1.65;
          color: #706965;
          margin: 0 0 12px;
        }

        .email {
          font-family: 'Inter', sans-serif;
          font-size: 0.88rem;
          color: #ff6b5a;
          text-decoration: none;
        }

        .email:hover {
          text-decoration: underline;
        }

        .note {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          line-height: 1.5;
          color: #9a918b;
          margin: 30px 0 0;
        }

        @media (max-width: 600px) {
          .delete-page {
            padding: 35px 16px 60px;
          }

          .delete-card {
            padding: 32px 22px;
            border-radius: 20px;
          }

          h1 {
            font-size: 2rem;
          }

          .step {
            padding: 13px;
          }

          .profile-button {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>
    </>
  )
}