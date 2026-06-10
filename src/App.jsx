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

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app">
      <Navbar page={page} setPage={setPage} />
      {page === 'home' ? (
        <>
          <Hero />
          <Features />
          <About />
          <Team />
          <Testimonials />
          <Contact />
          <Footer />
        </>
      ) : (
        <BridgeTest />
      )}
    </div>
  )
}

export default App
