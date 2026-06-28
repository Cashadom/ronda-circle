import './CitiesMarquee.css'

export default function CitiesMarquee() {
  const cities = ['London', 'New York', 'Berlin', 'Paris', 'Singapore', 'Lisbon', 'Toronto', 'Barcelona', 'Amsterdam', 'Tokyo', 'Melbourne', 'Dubai', 'Chennai']
  const doubled = [...cities, ...cities]

  return (
    <section className="cities-marquee">
      <p className="marquee-label">Growing city by city</p>
      <div className="marquee-track">
        {doubled.map((city, i) => (
          <span key={`${city}-${i}`} className="marquee-city">
            {city}
          </span>
        ))}
      </div>
    </section>
  )
}