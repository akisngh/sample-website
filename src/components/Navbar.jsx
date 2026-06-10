import { useState } from 'react'

function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function goHome() {
    setPage('home')
    setMenuOpen(false)
  }

  function goBridge() {
    setPage('bridge')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#hero" className="navbar-logo" onClick={(e) => { e.preventDefault(); goHome(); }}>MPL Gaming</a>
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
        <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
          {page === 'home' ? (
            <>
              <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
              <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
              <li><a href="#team" onClick={() => setMenuOpen(false)}>Team</a></li>
              <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
            </>
          ) : null}
          <li>
            <a
              href="#"
              className={page === 'bridge' ? 'nav-active' : ''}
              onClick={(e) => { e.preventDefault(); page === 'bridge' ? goHome() : goBridge(); }}
            >
              {page === 'bridge' ? 'Home' : 'Bridge'}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
