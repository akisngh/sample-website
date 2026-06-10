# MPL Gaming Website — Design Spec

## Overview

A single-page React website for MPL Gaming, built with Vite and plain CSS, deployed to GitHub Pages. The site has a colorful, playful visual style with 7 sections: Navbar, Hero, Features, About, Team, Testimonials, Contact, and Footer. Uses dummy/placeholder content throughout.

## Tech Stack

- **Framework:** React 19 (already in place)
- **Build tool:** Vite 8 (already in place)
- **Styling:** Plain CSS with CSS variables, gradients, and animations
- **Deployment:** GitHub Actions → GitHub Pages
- **Live URL:** `https://akisngh.github.io/sample-website/`

## File Structure

```
src/
  components/
    Navbar.jsx         # Fixed top nav with smooth-scroll links
    Hero.jsx           # Big headline, tagline, CTA button
    Features.jsx       # 4 feature cards in a grid
    About.jsx          # Company story with placeholder image
    Team.jsx           # 4 team member cards
    Testimonials.jsx   # 3 customer quote cards
    Contact.jsx        # Contact form (name, email, message)
    Footer.jsx         # Links, social icons, copyright
  styles/
    global.css         # CSS variables, resets, base typography
    sections.css       # Per-section styles
  App.jsx              # Assembles all section components
  main.jsx             # Entry point (unchanged)
.github/
  workflows/
    deploy.yml         # GitHub Actions workflow for Pages deployment
```

Files to remove: `src/App.css` (replaced by `styles/sections.css`), `src/index.css` (replaced by `styles/global.css`).

## Color Palette & Visual Theme

- **Primary gradient:** Purple (#7c3aed) to pink (#ec4899) — used for hero background, CTA buttons
- **Accent colors:** Yellow/orange (#f59e0b) for highlights, teal (#14b8a6) for secondary accents
- **Backgrounds:** White/light gray (#f9fafb) for card sections, dark (#1e1b4b) for footer
- **Text:** Dark (#111827) on light backgrounds, white (#ffffff) on gradient/dark backgrounds
- **Cards:** White with rounded corners (12-16px radius), soft box shadows, subtle hover scale (1.03)

### Typography

- System font stack: `system-ui, 'Segoe UI', Roboto, sans-serif`
- Headings: Bold (700), large sizes (48-56px hero, 36px section titles, 20px card titles)
- Body: Regular (400), 16-18px

### Playful Touches

- Gradient backgrounds on hero and contact sections
- Emoji icons on feature cards (e.g. trophy, gamepad, community, star)
- Hover lift/scale animations on cards (transform + box-shadow transition)
- Smooth scroll behavior between sections
- Rounded, gradient CTA buttons with hover glow effect
- Semi-transparent navbar with backdrop blur

## Section Specifications

### 1. Navbar

- Fixed position at top of viewport
- Semi-transparent background with backdrop-filter blur
- Left: "MPL Gaming" logo text (bold, gradient text or white)
- Right: navigation links — Features, About, Team, Contact
- Links use smooth scroll (`scroll-behavior: smooth` + anchor hrefs)
- On mobile: hamburger menu (toggle visibility of links)

### 2. Hero

- Full viewport height (100vh)
- Purple-to-pink gradient background
- Centered content:
  - Headline: "Level Up Your Gaming Experience"
  - Tagline: "Join millions of gamers competing in tournaments, streaming live, and winning rewards."
  - CTA button: "Get Started" — rounded, bright gradient, hover glow
- White text throughout

### 3. Features

- Section title: "What We Offer"
- 4 feature cards in a 2x2 grid (stacks to 1 column on mobile):
  1. **Tournaments** (trophy emoji) — "Compete in daily tournaments across multiple games and win exciting prizes."
  2. **Live Streaming** (gamepad emoji) — "Watch and stream live gameplay with your favorite gamers."
  3. **Community** (people emoji) — "Connect with millions of gamers, form teams, and make friends."
  4. **Rewards** (star emoji) — "Earn points, unlock achievements, and redeem exclusive rewards."
- Each card: white background, rounded corners, emoji at top (large, ~48px), title, description
- Hover: slight scale up (1.03) + enhanced shadow

### 4. About

- Section title: "About MPL Gaming"
- Two-column layout (stacks on mobile):
  - Left: 2 paragraphs of placeholder text about the company's mission, founding story, and vision
  - Right: Placeholder image (colored gradient rectangle or placeholder service image)
- Light background

### 5. Team

- Section title: "Meet Our Team"
- 4 team member cards in a row (2x2 on tablet, 1 column on mobile):
  - Circular avatar placeholder (colored gradient circle with initials)
  - Name (dummy)
  - Role (dummy)
- Cards: white, rounded, centered text, hover lift

### 6. Testimonials

- Section title: "What Gamers Say"
- 3 testimonial cards (stacked or side by side on desktop):
  - Large opening quote mark (decorative)
  - Quote text (placeholder)
  - Author name and "Gamer" label
- Cards with subtle gradient border or left accent border
- Light gray background for the section

### 7. Contact

- Section title: "Get In Touch"
- Purple-to-pink gradient background (matching hero)
- Centered form with white/semi-transparent card:
  - Fields: Name (text), Email (email), Message (textarea)
  - Submit button: gradient, rounded, matching CTA style
- Form is visual only — no backend. Submit shows an alert or brief thank-you message.

### 8. Footer

- Dark background (#1e1b4b)
- Three columns (stacks on mobile):
  - Col 1: "MPL Gaming" logo text + short tagline
  - Col 2: Quick links — Home, Features, About, Team, Contact
  - Col 3: Social icons (placeholder SVG icons for Twitter/X, Discord, Instagram, YouTube)
- Bottom bar: "(c) 2026 MPL Gaming. All rights reserved."
- White/light gray text

## Responsive Breakpoints

- **Desktop:** > 1024px — full multi-column layouts
- **Tablet:** 768px - 1024px — 2-column grids
- **Mobile:** < 768px — single column, stacked layouts, hamburger nav

## Deployment Configuration

### Vite Config

Add `base: '/sample-website/'` to `vite.config.js` so asset paths work on the GitHub Pages subdirectory.

### GitHub Actions Workflow

`.github/workflows/deploy.yml`:
- Trigger: push to `main` branch
- Steps: checkout → setup Node 20 → npm ci → npm run build → deploy `dist/` to GitHub Pages using `actions/deploy-pages`
- Uses the official `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages` actions.

### GitHub Pages Settings

The repo needs Pages enabled with source set to "GitHub Actions" (not branch-based). This is configured in repo Settings > Pages.

## What's NOT Included

- No routing library (single page, anchor links only)
- No backend/API — contact form is frontend-only
- No CMS or content management
- No analytics or tracking
- No authentication
