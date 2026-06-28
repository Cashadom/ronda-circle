import Link from 'next/link'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/point.png" alt="" className="footer-icon" />
          <span>Ronda Club</span>
          <p className="footer-tagline">Circles Enhancer</p>
        </div>

        <nav className="footer-links">
          <Link href="/terms" className="footer-link">Terms</Link>
        </nav>

        <div className="footer-copy">
          &copy; {new Date().getFullYear()} Ronda Club
        </div>
      </div>
    </footer>
  )
}