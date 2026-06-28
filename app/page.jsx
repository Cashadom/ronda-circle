import Navbar from '@/components/Navbar'
import Hero from '@/components/landing/Hero'
import CircleGrid from '@/components/circles/CircleGrid'
import CitiesMarquee from '@/components/common/CitiesMarquee'
import Footer from '@/components/common/Footer'
import './page.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="home">
        {/* ─── Hero en haut ─── */}
        <section className="hero-section">
          <img src="/fond.png" alt="Ronda Club" className="hero-image" />
        </section>

        <div className="home-main">
          {/* ─── Titre juste avant les cartes ─── */}
          <div className="section-title-wrapper">
            <h2 className="section-title">Most popular circles</h2>
          </div>

          {/* ─── Grille ─── */}
          <CircleGrid />

          {/* ─── CitiesMarquee ─── */}
          <CitiesMarquee />

          {/* ─── Petit espace avant le footer ─── */}
          <div className="spacer" />
        </div>

        <Footer />
      </main>
    </>
  )
}