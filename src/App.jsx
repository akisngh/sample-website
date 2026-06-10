import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Team from './components/Team'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BridgeTest from './components/BridgeTest'
import FeaturePage from './components/FeaturePage'

const BASE = import.meta.env.BASE_URL

function pageToPath(page) {
  if (page === 'home') return BASE
  if (page === 'bridge') return BASE + 'bridge'
  if (page.startsWith('feature:')) return BASE + page.replace('feature:', '')
  return BASE
}

function pathToPage(path) {
  const p = path.replace(BASE, '').replace(/\/$/, '')
  if (!p || p === '') return 'home'
  if (p === 'bridge') return 'bridge'
  return 'feature:' + p
}

function App() {
  const [page, setPage] = useState(() => pathToPage(window.location.pathname))

  useEffect(() => {
    function handlePopState(e) {
      setPage(e.state?.page || pathToPage(window.location.pathname))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigateTo(p) {
    window.history.pushState({ page: p }, '', pageToPath(p))
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <Navbar page={page} setPage={navigateTo} />
      {page === 'home' ? (
        <>
          <Hero />
          <Features onNavigate={(id) => navigateTo('feature:' + id)} />
          <About />
          <Team />
          <Testimonials />
          <Contact />
          <Footer />
        </>
      ) : page === 'bridge' ? (
        <BridgeTest />
      ) : page.startsWith('feature:') ? (
        <FeaturePage featureId={page.replace('feature:', '')} onBack={() => navigateTo('home')} />
      ) : null}
    </div>
  )
}

export default App
