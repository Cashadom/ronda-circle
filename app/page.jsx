import Navbar from '@/components/Navbar'
import Hero from '@/components/landing/Hero'
import CircleGrid from '@/components/circles/CircleGrid'
import CitiesMarquee from '@/components/common/CitiesMarquee'
import Footer from '@/components/common/Footer'
import './page.css'

export const metadata = {
  title: 'Ronda Club',
  description: 'Join small public circles in your city or remotely.',
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">
        <section className="hero-section">
          <img src="/fond.png" alt="Ronda Club" className="hero-image" />
        </section>

        {/* 👇 Ici */}
        <CitiesMarquee />

        <div className="home-main">
          <div className="section-title-wrapper">
            <h2 className="section-title">Most popular circles</h2>
          </div>

          <CircleGrid />

          <div className="spacer" />
        </div>

        <Footer />
      </main>
    </>
  )
}