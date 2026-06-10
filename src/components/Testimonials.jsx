const testimonials = [
  {
    quote: 'MPL Gaming completely changed how I experience mobile gaming. The tournaments are exciting and the community is amazing!',
    author: 'Jordan Lee',
    label: 'Pro Gamer',
  },
  {
    quote: 'I love the rewards system. Every game feels meaningful and there is always something new to play for.',
    author: 'Maria Gonzalez',
    label: 'Casual Gamer',
  },
  {
    quote: 'The live streaming feature is top-notch. I have grown my audience and connected with gamers from all over the world.',
    author: 'Raj Patel',
    label: 'Streamer',
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="testimonials-section">
      <h2 className="section-title">What Gamers Say</h2>
      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div className="testimonial-card" key={t.author}>
            <span className="quote-mark">&ldquo;</span>
            <p className="quote-text">{t.quote}</p>
            <div className="quote-author">
              <strong>{t.author}</strong>
              <span>{t.label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
