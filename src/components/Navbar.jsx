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

  function goTicTacToe() {
    setPage('tictactoe')
    setMenuOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-nav-buttons">
          <button
            className="navbar-back"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="navbar-forward"
            onClick={() => window.history.forward()}
            aria-label="Go forward"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
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
          <li>
            <a
              href="#"
              className={page === 'tictactoe' ? 'nav-active' : ''}
              onClick={(e) => { e.preventDefault(); page === 'tictactoe' ? goHome() : goTicTacToe(); }}
            >
              {page === 'tictactoe' ? 'Home' : 'Tic Tac Toe'}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
