import { useState } from 'react'
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

function App() {
  const [page, setPage] = useState('home')

  function navigateTo(p) {
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
