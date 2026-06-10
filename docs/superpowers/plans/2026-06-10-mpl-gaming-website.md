# MPL Gaming Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page MPL Gaming website with 7 sections (Navbar, Hero, Features, About, Team, Testimonials, Contact, Footer) using React + Vite + plain CSS, deployed to GitHub Pages.

**Architecture:** Single `App.jsx` imports 8 section components. All styling lives in two CSS files (`global.css` for variables/resets, `sections.css` for section-specific styles). GitHub Actions deploys `dist/` to Pages on push to main.

**Tech Stack:** React 19, Vite 8, plain CSS, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-06-10-mpl-gaming-website-design.md`

---

### Task 1: Foundation — Global CSS and App Shell

**Files:**
- Create: `src/styles/global.css`
- Create: `src/styles/sections.css`
- Modify: `src/main.jsx` (change CSS import)
- Modify: `src/App.jsx` (strip template content)
- Modify: `vite.config.js` (add base path)
- Remove: `src/App.css`
- Remove: `src/index.css`

- [ ] **Step 1: Create `src/styles/global.css` with CSS variables, reset, and base typography**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  /* Primary gradient */
  --purple: #7c3aed;
  --pink: #ec4899;
  --gradient-primary: linear-gradient(135deg, var(--purple), var(--pink));

  /* Accents */
  --yellow: #f59e0b;
  --teal: #14b8a6;

  /* Backgrounds */
  --bg-white: #ffffff;
  --bg-light: #f9fafb;
  --bg-dark: #1e1b4b;

  /* Text */
  --text-dark: #111827;
  --text-light: #ffffff;
  --text-muted: #6b7280;

  /* Cards */
  --card-radius: 16px;
  --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --card-shadow-hover: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Typography */
  --font-sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;

  /* Spacing */
  --section-padding: 96px 24px;
  --section-padding-mobile: 64px 16px;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-sans);
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-dark);
  background: var(--bg-white);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3 {
  font-weight: 700;
  line-height: 1.2;
}

h1 {
  font-size: 56px;
  letter-spacing: -1.5px;
}

h2 {
  font-size: 36px;
  letter-spacing: -0.5px;
  margin-bottom: 16px;
}

h3 {
  font-size: 20px;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

button {
  cursor: pointer;
  border: none;
  font-family: inherit;
  font-size: inherit;
}

@media (max-width: 768px) {
  :root {
    --section-padding: 48px 16px;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 28px;
  }

  body {
    font-size: 16px;
  }
}
```

- [ ] **Step 2: Create empty `src/styles/sections.css`**

```css
/* Section-specific styles — added per task */
```

- [ ] **Step 3: Update `src/main.jsx` to import new CSS**

Replace the contents of `src/main.jsx` with:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/sections.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 4: Replace `src/App.jsx` with empty shell**

```jsx
function App() {
  return (
    <div className="app">
      <p>MPL Gaming — coming soon</p>
    </div>
  )
}

export default App
```

- [ ] **Step 5: Update `vite.config.js` with base path**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sample-website/',
})
```

- [ ] **Step 6: Delete old CSS files**

```bash
rm src/App.css src/index.css
```

- [ ] **Step 7: Verify dev server starts**

```bash
npm run dev
```

Open the browser — should see "MPL Gaming — coming soon" with no errors in console.

- [ ] **Step 8: Verify build works**

```bash
npm run build
```

Expected: `dist/` folder created with no errors.

- [ ] **Step 9: Commit**

```bash
git add src/styles/global.css src/styles/sections.css src/main.jsx src/App.jsx vite.config.js
git rm src/App.css src/index.css
git commit -m "feat: set up foundation — global CSS, app shell, base path"
```

---

### Task 2: Navbar Component

**Files:**
- Create: `src/components/Navbar.jsx`
- Modify: `src/styles/sections.css` (append navbar styles)
- Modify: `src/App.jsx` (add Navbar)

- [ ] **Step 1: Create `src/components/Navbar.jsx`**

```jsx
import { useState } from 'react'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="#hero" className="navbar-logo">MPL Gaming</a>
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${menuOpen ? 'open' : ''}`}></span>
        </button>
        <ul className={`navbar-links ${menuOpen ? 'show' : ''}`}>
          <li><a href="#features" onClick={() => setMenuOpen(false)}>Features</a></li>
          <li><a href="#about" onClick={() => setMenuOpen(false)}>About</a></li>
          <li><a href="#team" onClick={() => setMenuOpen(false)}>Team</a></li>
          <li><a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
```

- [ ] **Step 2: Append navbar styles to `src/styles/sections.css`**

```css
/* ===== Navbar ===== */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  font-size: 24px;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-links {
  display: flex;
  list-style: none;
  gap: 32px;
}

.navbar-links a {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-dark);
  transition: color 0.2s;
}

.navbar-links a:hover {
  color: var(--purple);
}

.navbar-toggle {
  display: none;
  background: none;
  padding: 8px;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: var(--text-dark);
  position: relative;
  transition: background 0.2s;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 2px;
  background: var(--text-dark);
  left: 0;
  transition: transform 0.2s;
}

.hamburger::before {
  top: -7px;
}

.hamburger::after {
  top: 7px;
}

.hamburger.open {
  background: transparent;
}

.hamburger.open::before {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open::after {
  transform: translateY(-7px) rotate(-45deg);
}

@media (max-width: 768px) {
  .navbar-toggle {
    display: block;
  }

  .navbar-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    flex-direction: column;
    padding: 16px 24px;
    gap: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .navbar-links.show {
    display: flex;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx` to include Navbar**

```jsx
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="app">
      <Navbar />
      <p style={{ paddingTop: '80px' }}>MPL Gaming — coming soon</p>
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Check: fixed navbar at top, gradient logo text, links on desktop, hamburger menu on mobile (resize window to <768px). Clicking hamburger toggles nav links.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Navbar with responsive hamburger menu"
```

---

### Task 3: Hero Section

**Files:**
- Create: `src/components/Hero.jsx`
- Modify: `src/styles/sections.css` (append hero styles)
- Modify: `src/App.jsx` (add Hero)

- [ ] **Step 1: Create `src/components/Hero.jsx`**

```jsx
function Hero() {
  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        <h1>Level Up Your Gaming Experience</h1>
        <p className="hero-tagline">
          Join millions of gamers competing in tournaments, streaming live, and winning rewards.
        </p>
        <a href="#features" className="btn-cta">Get Started</a>
      </div>
    </section>
  )
}

export default Hero
```

- [ ] **Step 2: Append hero styles to `src/styles/sections.css`**

```css
/* ===== Hero ===== */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  padding: 120px 24px 96px;
  text-align: center;
}

.hero-content {
  max-width: 720px;
}

.hero-content h1 {
  color: var(--text-light);
  margin-bottom: 24px;
}

.hero-tagline {
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  margin-bottom: 40px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-block;
  padding: 16px 40px;
  background: var(--yellow);
  color: var(--text-dark);
  font-size: 18px;
  font-weight: 700;
  border-radius: 50px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

@media (max-width: 768px) {
  .hero-section {
    padding: 100px 16px 64px;
  }

  .hero-tagline {
    font-size: 18px;
  }

  .btn-cta {
    padding: 14px 32px;
    font-size: 16px;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Check: full-viewport gradient hero, white centered text, yellow CTA button with hover glow, smooth scroll to features anchor.

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Hero section with gradient background and CTA"
```

---

### Task 4: Features Section

**Files:**
- Create: `src/components/Features.jsx`
- Modify: `src/styles/sections.css` (append features styles)
- Modify: `src/App.jsx` (add Features)

- [ ] **Step 1: Create `src/components/Features.jsx`**

```jsx
const features = [
  {
    emoji: '\u{1F3C6}',
    title: 'Tournaments',
    description: 'Compete in daily tournaments across multiple games and win exciting prizes.',
  },
  {
    emoji: '\u{1F3AE}',
    title: 'Live Streaming',
    description: 'Watch and stream live gameplay with your favorite gamers.',
  },
  {
    emoji: '\u{1F465}',
    title: 'Community',
    description: 'Connect with millions of gamers, form teams, and make friends.',
  },
  {
    emoji: '\u{2B50}',
    title: 'Rewards',
    description: 'Earn points, unlock achievements, and redeem exclusive rewards.',
  },
]

function Features() {
  return (
    <section id="features" className="features-section">
      <h2 className="section-title">What We Offer</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <div className="feature-card" key={feature.title}>
            <span className="feature-emoji">{feature.emoji}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features
```

- [ ] **Step 2: Append features styles to `src/styles/sections.css`**

```css
/* ===== Shared ===== */
.section-title {
  text-align: center;
  margin-bottom: 48px;
}

/* ===== Features ===== */
.features-section {
  padding: var(--section-padding);
  background: var(--bg-white);
  max-width: 1200px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--bg-light);
  border-radius: var(--card-radius);
  padding: 32px;
  box-shadow: var(--card-shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: var(--card-shadow-hover);
}

.feature-emoji {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin-bottom: 8px;
  color: var(--text-dark);
}

.feature-card p {
  color: var(--text-muted);
  font-size: 16px;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: 4 cards in 2x2 grid on desktop, 1 column on mobile, emoji icons, hover lift animation.

- [ ] **Step 5: Commit**

```bash
git add src/components/Features.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Features section with emoji cards and hover effects"
```

---

### Task 5: About Section

**Files:**
- Create: `src/components/About.jsx`
- Modify: `src/styles/sections.css` (append about styles)
- Modify: `src/App.jsx` (add About)

- [ ] **Step 1: Create `src/components/About.jsx`**

```jsx
function About() {
  return (
    <section id="about" className="about-section">
      <h2 className="section-title">About MPL Gaming</h2>
      <div className="about-content">
        <div className="about-text">
          <p>
            Founded in 2020, MPL Gaming has grown into one of the leading mobile gaming
            platforms in the world. Our mission is to make competitive gaming accessible
            to everyone, everywhere. We believe that gaming brings people together and
            creates unforgettable moments.
          </p>
          <p>
            With over 10 million active users across 15 countries, we host thousands of
            tournaments every day. From casual players to professional esports athletes,
            our platform offers something for every level of gamer. We are committed to
            building a fair, fun, and rewarding gaming ecosystem.
          </p>
        </div>
        <div className="about-image">
          <div className="about-image-placeholder"></div>
        </div>
      </div>
    </section>
  )
}

export default About
```

- [ ] **Step 2: Append about styles to `src/styles/sections.css`**

```css
/* ===== About ===== */
.about-section {
  padding: var(--section-padding);
  background: var(--bg-light);
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.about-text p {
  color: var(--text-muted);
  margin-bottom: 16px;
  font-size: 17px;
}

.about-text p:last-child {
  margin-bottom: 0;
}

.about-image-placeholder {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: var(--card-radius);
  background: var(--gradient-primary);
  opacity: 0.8;
}

@media (max-width: 768px) {
  .about-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <About />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: two-column layout on desktop (text left, gradient placeholder right), stacks on mobile.

- [ ] **Step 5: Commit**

```bash
git add src/components/About.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add About section with two-column layout"
```

---

### Task 6: Team Section

**Files:**
- Create: `src/components/Team.jsx`
- Modify: `src/styles/sections.css` (append team styles)
- Modify: `src/App.jsx` (add Team)

- [ ] **Step 1: Create `src/components/Team.jsx`**

```jsx
const team = [
  { name: 'Alex Rivera', role: 'CEO & Founder', initials: 'AR', color: '#7c3aed' },
  { name: 'Sarah Chen', role: 'Head of Product', initials: 'SC', color: '#ec4899' },
  { name: 'James Okafor', role: 'Lead Engineer', initials: 'JO', color: '#14b8a6' },
  { name: 'Priya Sharma', role: 'Design Director', initials: 'PS', color: '#f59e0b' },
]

function Team() {
  return (
    <section id="team" className="team-section">
      <h2 className="section-title">Meet Our Team</h2>
      <div className="team-grid">
        {team.map((member) => (
          <div className="team-card" key={member.name}>
            <div
              className="team-avatar"
              style={{ background: member.color }}
            >
              {member.initials}
            </div>
            <h3>{member.name}</h3>
            <p>{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Team
```

- [ ] **Step 2: Append team styles to `src/styles/sections.css`**

```css
/* ===== Team ===== */
.team-section {
  padding: var(--section-padding);
  background: var(--bg-white);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.team-card {
  text-align: center;
  padding: 32px 16px;
  background: var(--bg-light);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover);
}

.team-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.team-card h3 {
  margin-bottom: 4px;
}

.team-card p {
  color: var(--text-muted);
  font-size: 15px;
}

@media (max-width: 1024px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .team-grid {
    grid-template-columns: 1fr;
    max-width: 360px;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Team from './components/Team'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Team />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: 4 cards in a row on desktop, 2x2 on tablet, 1 column on mobile. Circular colored avatars with initials.

- [ ] **Step 5: Commit**

```bash
git add src/components/Team.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Team section with avatar cards"
```

---

### Task 7: Testimonials Section

**Files:**
- Create: `src/components/Testimonials.jsx`
- Modify: `src/styles/sections.css` (append testimonials styles)
- Modify: `src/App.jsx` (add Testimonials)

- [ ] **Step 1: Create `src/components/Testimonials.jsx`**

```jsx
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
```

- [ ] **Step 2: Append testimonials styles to `src/styles/sections.css`**

```css
/* ===== Testimonials ===== */
.testimonials-section {
  padding: var(--section-padding);
  background: var(--bg-light);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.testimonial-card {
  background: var(--bg-white);
  border-radius: var(--card-radius);
  padding: 32px;
  border-left: 4px solid var(--purple);
  box-shadow: var(--card-shadow);
  position: relative;
}

.quote-mark {
  font-size: 64px;
  line-height: 1;
  color: var(--purple);
  opacity: 0.2;
  position: absolute;
  top: 16px;
  left: 24px;
  font-family: Georgia, serif;
}

.quote-text {
  color: var(--text-muted);
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.quote-author {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quote-author strong {
  color: var(--text-dark);
  font-size: 16px;
}

.quote-author span {
  color: var(--purple);
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .testimonials-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Team from './components/Team'
import Testimonials from './components/Testimonials'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Team />
      <Testimonials />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: 3 cards side by side on desktop, stacked on mobile. Purple left border, large decorative quote mark, author info at bottom.

- [ ] **Step 5: Commit**

```bash
git add src/components/Testimonials.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Testimonials section with quote cards"
```

---

### Task 8: Contact Section

**Files:**
- Create: `src/components/Contact.jsx`
- Modify: `src/styles/sections.css` (append contact styles)
- Modify: `src/App.jsx` (add Contact)

- [ ] **Step 1: Create `src/components/Contact.jsx`**

```jsx
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
```

- [ ] **Step 2: Append contact styles to `src/styles/sections.css`**

```css
/* ===== Contact ===== */
.contact-section {
  padding: var(--section-padding);
  background: var(--gradient-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.contact-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: var(--card-radius);
  padding: 48px;
  width: 100%;
  max-width: 560px;
  box-shadow: var(--card-shadow-hover);
}

.contact-thanks {
  text-align: center;
  font-size: 18px;
  color: var(--purple);
  font-weight: 600;
  padding: 24px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-family: var(--font-sans);
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--purple);
}

.contact-card .btn-cta {
  width: 100%;
  text-align: center;
  border: none;
  font-size: 16px;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .contact-card {
    padding: 32px 24px;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx`**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Team from './components/Team'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Team />
      <Testimonials />
      <Contact />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: gradient background, centered white card with form, inputs focus with purple border, submit shows thank-you message.

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Contact section with form and thank-you state"
```

---

### Task 9: Footer

**Files:**
- Create: `src/components/Footer.jsx`
- Modify: `src/styles/sections.css` (append footer styles)
- Modify: `src/App.jsx` (add Footer)

- [ ] **Step 1: Create `src/components/Footer.jsx`**

```jsx
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>MPL Gaming</h3>
          <p>Making competitive gaming accessible to everyone, everywhere.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#hero">Home</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="Discord">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 MPL Gaming. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
```

- [ ] **Step 2: Append footer styles to `src/styles/sections.css`**

```css
/* ===== Footer ===== */
.footer {
  background: var(--bg-dark);
  color: rgba(255, 255, 255, 0.7);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 64px 24px 32px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 48px;
}

.footer-brand h3 {
  color: white;
  font-size: 24px;
  margin-bottom: 12px;
}

.footer-brand p {
  font-size: 15px;
  line-height: 1.6;
}

.footer h4 {
  color: white;
  font-size: 16px;
  margin-bottom: 16px;
}

.footer-links ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  font-size: 15px;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: white;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icons a {
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.2s;
}

.social-icons a:hover {
  color: var(--yellow);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  padding: 24px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 32px;
    text-align: center;
    padding: 48px 24px 24px;
  }

  .social-icons {
    justify-content: center;
  }
}
```

- [ ] **Step 3: Update `src/App.jsx` — final version with all components**

```jsx
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Team from './components/Team'
import Testimonials from './components/Testimonials'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Team />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
```

- [ ] **Step 4: Verify in browser**

Check: dark footer with 3 columns on desktop, stacked on mobile. Social icons turn yellow on hover. Copyright at bottom. All nav links in footer scroll to correct sections.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.jsx src/styles/sections.css src/App.jsx
git commit -m "feat: add Footer with links, social icons, and copyright"
```

---

### Task 10: Cleanup and Final Polish

**Files:**
- Modify: `index.html` (update title)
- Remove: `src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png` (unused template assets)

- [ ] **Step 1: Update `index.html` title**

Change `<title>sample-website</title>` to `<title>MPL Gaming</title>` and update the favicon link to use a simpler inline SVG or remove the custom favicon reference:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MPL Gaming</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Remove unused template assets**

```bash
rm src/assets/react.svg src/assets/vite.svg src/assets/hero.png
```

- [ ] **Step 3: Verify build succeeds with no warnings**

```bash
npm run build
```

Expected: clean build, no missing import warnings, `dist/` folder generated.

- [ ] **Step 4: Preview the production build**

```bash
npm run preview
```

Open in browser and verify all sections render correctly, scroll nav works, responsive at all breakpoints.

- [ ] **Step 5: Commit**

```bash
git add index.html
git rm src/assets/react.svg src/assets/vite.svg src/assets/hero.png
git commit -m "chore: update title and remove unused template assets"
```

---

### Task 11: GitHub Actions Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the workflow YAML is valid**

```bash
cat .github/workflows/deploy.yml
```

Visually confirm indentation is correct (YAML is sensitive to indentation).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions workflow for Pages deployment"
```

- [ ] **Step 4: Push to trigger deployment**

```bash
git push origin main
```

- [ ] **Step 5: Enable GitHub Pages in repo settings**

Go to the repo Settings > Pages. Under "Build and deployment", set Source to "GitHub Actions".

The site will be live at `https://akisngh.github.io/sample-website/` after the first workflow run completes.
