import { useState } from 'react'

function Contact() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="contact" className="contact-section">
      <h2 className="section-title" style={{ color: 'white' }}>Get In Touch</h2>
      <div className="contact-card">
        {submitted ? (
          <p className="contact-thanks">Thanks for reaching out! We will get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" placeholder="Your name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="5" placeholder="Your message..." required></textarea>
            </div>
            <button type="submit" className="btn-cta">Send Message</button>
          </form>
        )}
      </div>
    </section>
  )
}

export default Contact
