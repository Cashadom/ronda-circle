import Navbar from '@/components/Navbar'
import CircleGrid from '@/components/circles/CircleGrid'
import CitiesMarquee from '@/components/common/CitiesMarquee'
import Footer from '@/components/common/Footer'
import './page.css'

export const metadata = {
  title: 'Ronda Club — Find your people, simply connect.',
  description:
    'Discover people in your city, connect around shared interests and meet new people.',
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="home">

        <section className="hero-section">
          <img
            src="/fond.png"
            alt="Find your people with Ronda"
            className="hero-image"
          />
        </section>

        <CitiesMarquee />

        <div className="home-main">

          <div className="section-title-wrapper">
            <h2 className="section-title">
              People near you
            </h2>
          </div>

          <CircleGrid />

          <div className="spacer" />

        </div>

        <Footer />

      </main>
    </>
  )
}