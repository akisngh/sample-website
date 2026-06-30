# Chicken Racing Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single-player vertical chicken racing game where the player taps to run and swipes to dodge obstacles, racing against a 10-second timer.

**Architecture:** Single React component (`ChickenRacing.jsx`) using `requestAnimationFrame` for the game loop, CSS transforms for animations, and touch events for input. Follows the exact same patterns as the existing `TicTacToe.jsx` for Bridge integration and score reporting. Styles appended to `sections.css`.

**Tech Stack:** React 19, CSS animations/transforms, native Bridge API

---

### Task 1: Add Routing and Feature Card

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Features.jsx`

- [ ] **Step 1: Add ChickenRacing import and route to App.jsx**

In `src/App.jsx`, add the import at line 12 (after the TicTacToe import):

```javascript
import ChickenRacing from './components/ChickenRacing'
```

Add the route mapping in `pageToPath` (after the tictactoe line):

```javascript
if (page === 'chickenracing') return BASE + 'chickenracing'
```

Add the route mapping in `pathToPage` (after the tictactoe line):

```javascript
if (p === 'chickenracing') return 'chickenracing'
```

Add the page render in the JSX (after the tictactoe ternary):

```jsx
) : page === 'chickenracing' ? (
  <ChickenRacing />
```

- [ ] **Step 2: Add chicken racing feature card to Features.jsx**

In `src/components/Features.jsx`, add a new entry to the `features` array:

```javascript
{
  id: 'chickenracing',
  emoji: '\u{1F414}',
  title: 'Chicken Racing',
  description: 'Tap to race your chicken and dodge obstacles before time runs out!',
},
```

- [ ] **Step 3: Create empty ChickenRacing component placeholder**

Create `src/components/ChickenRacing.jsx` with a minimal placeholder so the app compiles:

```jsx
function ChickenRacing() {
  return (
    <section className="cr-section">
      <div className="cr-container">
        <h1>Chicken Racing</h1>
      </div>
    </section>
  )
}

export default ChickenRacing
```

- [ ] **Step 4: Verify the app compiles and route works**

Run: `npm run dev`

Open the browser, click the "Chicken Racing" feature card, and confirm it navigates to `/sample-website/chickenracing` and shows the placeholder heading.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/Features.jsx src/components/ChickenRacing.jsx
git commit -m "feat: add chicken racing route and feature card"
```

---

### Task 2: Game State and Pre-Game Screen

**Files:**
- Modify: `src/components/ChickenRacing.jsx`

- [ ] **Step 1: Add game state and constants**

Replace the content of `src/components/ChickenRacing.jsx` with the full state setup:

```jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

// Game constants
const TIMER_DURATION = 10        // seconds
const TARGET_DISTANCE = 100      // arbitrary units to reach finish
const TAP_BOOST = 2.5            // distance per tap
const DECELERATION = 0.92        // speed multiplier per frame when not tapping
const OBSTACLE_SPEED = 3         // pixels per frame obstacle falls
const STUN_DURATION = 1000       // ms
const LANE_COUNT = 3
const COUNTDOWN_STEPS = [3, 2, 1, 'GO!']

function ChickenRacing() {
  // Game state
  const [gameState, setGameState] = useState('idle') // idle | countdown | playing | won | lost
  const [countdown, setCountdown] = useState(null)
  const [score, setScore] = useState({ wins: 0, losses: 0 })
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [distance, setDistance] = useState(0)
  const [lane, setLane] = useState(1) // 0=left, 1=center, 2=right
  const [obstacles, setObstacles] = useState([])
  const [stunned, setStunned] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Ready? Tap to Start!')

  // Refs for game loop values (avoid stale closures)
  const gameStateRef = useRef(gameState)
  const distanceRef = useRef(distance)
  const speedRef = useRef(0)
  const laneRef = useRef(lane)
  const obstaclesRef = useRef(obstacles)
  const stunnedRef = useRef(false)
  const timerRef = useRef(TIMER_DURATION)
  const lastFrameRef = useRef(0)
  const rafRef = useRef(null)

  // Keep refs in sync
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { laneRef.current = lane }, [lane])

  return (
    <section className="cr-section">
      <div className="cr-container">
        <h1>Chicken Racing</h1>
        <p className="cr-subtitle">Tap to run, swipe to dodge!</p>

        {/* Scoreboard */}
        <div className="cr-scoreboard">
          <div className="cr-score-item cr-score-wins">
            <span className="cr-score-label">Wins</span>
            <span className="cr-score-value">{score.wins}</span>
          </div>
          <div className="cr-score-item cr-score-losses">
            <span className="cr-score-label">Losses</span>
            <span className="cr-score-value">{score.losses}</span>
          </div>
        </div>

        {/* HUD: Timer + Progress */}
        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
          <div className="cr-hud">
            <div className={'cr-timer' + (timeLeft < 3 ? ' cr-timer-urgent' : '')}>
              {timeLeft.toFixed(1)}s
            </div>
            <div className="cr-progress-bar">
              <div
                className="cr-progress-fill"
                style={{ width: Math.min(100, (distance / TARGET_DISTANCE) * 100) + '%' }}
              />
            </div>
          </div>
        )}

        {/* Track */}
        <div className="cr-track">
          {/* Lane dividers */}
          <div className="cr-lane-divider cr-lane-divider-1" />
          <div className="cr-lane-divider cr-lane-divider-2" />

          {/* Countdown overlay */}
          {gameState === 'countdown' && countdown !== null && (
            <div className="cr-countdown">{countdown}</div>
          )}

          {/* Idle overlay */}
          {gameState === 'idle' && (
            <div className="cr-idle-overlay">Tap to Start!</div>
          )}

          {/* Result overlay */}
          {(gameState === 'won' || gameState === 'lost') && (
            <div className={'cr-result-overlay' + (gameState === 'won' ? ' cr-result-win' : ' cr-result-lose')}>
              {gameState === 'won' ? 'You Win!' : "Time's Up!"}
            </div>
          )}

          {/* Obstacles */}
          {obstacles.map((obs) => (
            <div
              key={obs.id}
              className="cr-obstacle"
              style={{
                left: (obs.lane * 33.33 + 16.66) + '%',
                top: obs.y + '%',
              }}
            >
              {obs.emoji}
            </div>
          ))}

          {/* Chicken */}
          <div
            className={
              'cr-chicken' +
              (stunned ? ' cr-chicken-stunned' : '') +
              (gameState === 'playing' && !stunned ? ' cr-chicken-running' : '')
            }
            style={{ left: (lane * 33.33 + 16.66) + '%' }}
          >
            🐔
          </div>
        </div>

        {/* Status message */}
        <div className="cr-status">{statusMsg}</div>

        {/* Actions */}
        {(gameState === 'won' || gameState === 'lost') && (
          <div className="cr-actions">
            <button className="bridge-btn green" onClick={() => {}}>
              Play Again
            </button>
            <button className="bridge-btn red" onClick={() => {}}>
              Exit Game
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ChickenRacing
```

- [ ] **Step 2: Verify the pre-game screen renders**

Run: `npm run dev`

Navigate to `/sample-website/chickenracing`. Confirm: heading, scoreboard, track area with "Tap to Start!" overlay, and status message all render.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChickenRacing.jsx
git commit -m "feat: add chicken racing game state and pre-game UI"
```

---

### Task 3: Countdown and Game Loop

**Files:**
- Modify: `src/components/ChickenRacing.jsx`

- [ ] **Step 1: Add the countdown logic**

Add this function inside the `ChickenRacing` component, after the ref sync effects:

```jsx
const startCountdown = useCallback(() => {
  if (gameStateRef.current !== 'idle') return
  setGameState('countdown')
  let step = 0
  const interval = setInterval(() => {
    if (step < COUNTDOWN_STEPS.length) {
      setCountdown(COUNTDOWN_STEPS[step])
      step++
    } else {
      clearInterval(interval)
      setCountdown(null)
      setGameState('playing')
      setStatusMsg('Tap to run! Swipe to dodge!')
      timerRef.current = TIMER_DURATION
      distanceRef.current = 0
      speedRef.current = 0
      lastFrameRef.current = performance.now()
      Bridge.gameStarted()
      startGameLoop()
    }
  }, 600)
}, [])
```

- [ ] **Step 2: Add the game loop**

Add this function inside the component, after `startCountdown`:

```jsx
const startGameLoop = useCallback(() => {
  function tick(now) {
    if (gameStateRef.current !== 'playing') return

    const dt = Math.min((now - lastFrameRef.current) / 1000, 0.1) // cap delta
    lastFrameRef.current = now

    // Update timer
    timerRef.current -= dt
    if (timerRef.current <= 0) {
      timerRef.current = 0
      setTimeLeft(0)
      endGame('lost')
      return
    }
    setTimeLeft(timerRef.current)

    // Update distance (only if not stunned)
    if (!stunnedRef.current) {
      speedRef.current *= DECELERATION
      distanceRef.current += speedRef.current * dt * 60
      if (distanceRef.current >= TARGET_DISTANCE) {
        distanceRef.current = TARGET_DISTANCE
        setDistance(TARGET_DISTANCE)
        endGame('won')
        return
      }
      setDistance(distanceRef.current)
    }

    // Update obstacles
    const updatedObs = obstaclesRef.current
      .map((obs) => ({ ...obs, y: obs.y + OBSTACLE_SPEED * dt * 60 }))
      .filter((obs) => obs.y < 110)

    // Collision detection: chicken is at ~80% from top, obstacle hits if in same lane and y is 75-85%
    if (!stunnedRef.current) {
      for (const obs of updatedObs) {
        if (obs.lane === laneRef.current && obs.y >= 72 && obs.y <= 88) {
          stunnedRef.current = true
          setStunned(true)
          speedRef.current = 0
          setStatusMsg('Ouch! Stunned!')
          setTimeout(() => {
            stunnedRef.current = false
            setStunned(false)
            if (gameStateRef.current === 'playing') {
              setStatusMsg('Tap to run! Swipe to dodge!')
            }
          }, STUN_DURATION)
          break
        }
      }
    }

    obstaclesRef.current = updatedObs
    setObstacles([...updatedObs])

    rafRef.current = requestAnimationFrame(tick)
  }

  rafRef.current = requestAnimationFrame(tick)
}, [])
```

- [ ] **Step 3: Add the endGame and reset functions**

Add these functions inside the component:

```jsx
function endGame(result) {
  gameStateRef.current = result === 'won' ? 'won' : 'lost'
  setGameState(result === 'won' ? 'won' : 'lost')
  if (rafRef.current) cancelAnimationFrame(rafRef.current)

  const newScore = {
    wins: score.wins + (result === 'won' ? 1 : 0),
    losses: score.losses + (result === 'won' ? 0 : 1),
  }
  setScore(newScore)
  setStatusMsg(result === 'won' ? 'You Win!' : "Time's Up!")
  sendResult(result === 'won' ? 'game_won' : 'game_lost', newScore)
}

function sendResult(eventName, s) {
  Bridge.instrumentation(eventName, {
    game: 'chicken_racing',
    score: s.wins,
    wins: s.wins,
    losses: s.losses,
    totalGames: s.wins + s.losses,
  })
}

function handleReset() {
  if (rafRef.current) cancelAnimationFrame(rafRef.current)
  setGameState('idle')
  setCountdown(null)
  setTimeLeft(TIMER_DURATION)
  setDistance(0)
  setLane(1)
  setObstacles([])
  setStunned(false)
  setStatusMsg('Ready? Tap to Start!')
  obstaclesRef.current = []
  distanceRef.current = 0
  speedRef.current = 0
  stunnedRef.current = false
  laneRef.current = 1
}

function handleExit() {
  if (rafRef.current) cancelAnimationFrame(rafRef.current)
  Bridge.instrumentation('game_exit', {
    game: 'chicken_racing',
    score: score.wins,
    wins: score.wins,
    losses: score.losses,
    totalGames: score.wins + score.losses,
  })
  Bridge.closeGame()
}
```

- [ ] **Step 4: Wire up the Play Again and Exit buttons**

Update the button `onClick` handlers in the JSX:

```jsx
<button className="bridge-btn green" onClick={handleReset}>
  Play Again
</button>
<button className="bridge-btn red" onClick={handleExit}>
  Exit Game
</button>
```

- [ ] **Step 5: Add cleanup effect**

Add this effect inside the component to clean up the rAF on unmount:

```jsx
useEffect(() => {
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }
}, [])
```

- [ ] **Step 6: Verify countdown and game loop**

Run: `npm run dev`

Navigate to chicken racing. The countdown/game-loop logic is wired but input isn't connected yet. Verify the component renders without errors in the console.

- [ ] **Step 7: Commit**

```bash
git add src/components/ChickenRacing.jsx
git commit -m "feat: add countdown, game loop, timer, and score reporting"
```

---

### Task 4: Touch Input (Tap to Run + Swipe to Dodge)

**Files:**
- Modify: `src/components/ChickenRacing.jsx`

- [ ] **Step 1: Add obstacle spawning**

Add a ref for the spawn timer and an effect that spawns obstacles during gameplay. Add this inside the component:

```jsx
const spawnIntervalRef = useRef(null)
const obstacleIdRef = useRef(0)

useEffect(() => {
  if (gameState === 'playing') {
    const OBSTACLE_EMOJIS = ['🪨', '🚧', '🌾']
    spawnIntervalRef.current = setInterval(() => {
      const elapsed = TIMER_DURATION - timerRef.current
      // Spawn faster as time progresses: 1500ms down to 800ms
      const spawnRate = Math.max(800, 1500 - elapsed * 70)
      clearInterval(spawnIntervalRef.current)
      spawnIntervalRef.current = setInterval(() => {
        const newObs = {
          id: obstacleIdRef.current++,
          lane: Math.floor(Math.random() * LANE_COUNT),
          y: -10,
          emoji: OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)],
        }
        obstaclesRef.current = [...obstaclesRef.current, newObs]
        setObstacles([...obstaclesRef.current])
      }, spawnRate)
    }, 1000) // initial delay before first obstacle

    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
    }
  } else {
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current)
  }
}, [gameState])
```

- [ ] **Step 2: Add touch event handlers**

Add a ref for the track element and touch tracking, then add the touch handlers inside the component:

```jsx
const trackRef = useRef(null)
const touchStartRef = useRef(null)

function handleTouchStart(e) {
  touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }

  if (gameState === 'idle') {
    startCountdown()
    return
  }

  if (gameStateRef.current === 'playing' && !stunnedRef.current) {
    speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
  }
}

function handleTouchEnd(e) {
  if (!touchStartRef.current) return

  const dx = e.changedTouches[0].clientX - touchStartRef.current.x
  const dy = e.changedTouches[0].clientY - touchStartRef.current.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  // Only register as swipe if horizontal movement > 30px and > vertical movement
  if (absDx > 30 && absDx > absDy && gameStateRef.current === 'playing' && !stunnedRef.current) {
    if (dx > 0 && laneRef.current < LANE_COUNT - 1) {
      const newLane = laneRef.current + 1
      laneRef.current = newLane
      setLane(newLane)
    } else if (dx < 0 && laneRef.current > 0) {
      const newLane = laneRef.current - 1
      laneRef.current = newLane
      setLane(newLane)
    }
  }

  touchStartRef.current = null
}

// Mouse fallback for desktop testing
function handleClick() {
  if (gameState === 'idle') {
    startCountdown()
    return
  }
  if (gameStateRef.current === 'playing' && !stunnedRef.current) {
    speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
  }
}

// Keyboard fallback for desktop testing
useEffect(() => {
  function handleKeyDown(e) {
    if (e.key === ' ' || e.key === 'Enter') {
      if (gameStateRef.current === 'idle') {
        startCountdown()
      } else if (gameStateRef.current === 'playing' && !stunnedRef.current) {
        speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
      }
    } else if (e.key === 'ArrowLeft' && gameStateRef.current === 'playing' && !stunnedRef.current) {
      if (laneRef.current > 0) {
        const newLane = laneRef.current - 1
        laneRef.current = newLane
        setLane(newLane)
      }
    } else if (e.key === 'ArrowRight' && gameStateRef.current === 'playing' && !stunnedRef.current) {
      if (laneRef.current < LANE_COUNT - 1) {
        const newLane = laneRef.current + 1
        laneRef.current = newLane
        setLane(newLane)
      }
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [startCountdown])
```

- [ ] **Step 3: Wire touch/click events to the track element**

Update the track `<div>` in the JSX to include event handlers and ref:

```jsx
<div
  className="cr-track"
  ref={trackRef}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  onClick={handleClick}
>
```

- [ ] **Step 4: Verify full gameplay works**

Run: `npm run dev`

Test the full game flow:
1. Click/tap the track to start countdown (3-2-1-GO!)
2. Click/tap rapidly to make the chicken progress
3. Use arrow keys (or swipe on mobile) to switch lanes
4. Obstacles spawn and scroll down
5. Collision stuns the chicken
6. Win by reaching 100% before 10s, or lose when timer expires
7. Play Again and Exit Game buttons work

- [ ] **Step 5: Commit**

```bash
git add src/components/ChickenRacing.jsx
git commit -m "feat: add touch input, obstacle spawning, and collision detection"
```

---

### Task 5: CSS Styling

**Files:**
- Modify: `src/styles/sections.css`

- [ ] **Step 1: Add all chicken racing styles**

Append the following CSS to the end of `src/styles/sections.css`:

```css
/* ===== Chicken Racing ===== */
.cr-section {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 80px 24px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
}

.cr-container {
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.cr-container h1 {
  font-size: 36px;
  margin-bottom: 4px;
}

.cr-subtitle {
  color: var(--text-muted);
  margin-bottom: 16px;
  font-size: 14px;
}

/* Scoreboard */
.cr-scoreboard {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.cr-score-item {
  flex: 1;
  padding: 12px 8px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cr-score-wins {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: white;
}

.cr-score-losses {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.cr-score-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.85;
}

.cr-score-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

/* HUD */
.cr-hud {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.cr-timer {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--purple);
  min-width: 60px;
  text-align: left;
}

.cr-timer-urgent {
  color: #ef4444;
  animation: cr-pulse 0.5s ease infinite;
}

@keyframes cr-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.cr-progress-bar {
  flex: 1;
  height: 14px;
  background: #e5e7eb;
  border-radius: 7px;
  overflow: hidden;
}

.cr-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--purple), #ec4899);
  border-radius: 7px;
  transition: width 0.1s linear;
}

/* Track */
.cr-track {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 5;
  background: linear-gradient(180deg, #2d5a27 0%, #3a7233 50%, #2d5a27 100%);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: pan-y;
}

.cr-lane-divider {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 0px,
    rgba(255, 255, 255, 0.4) 20px,
    transparent 20px,
    transparent 40px
  );
}

.cr-lane-divider-1 {
  left: 33.33%;
}

.cr-lane-divider-2 {
  left: 66.66%;
}

/* Chicken */
.cr-chicken {
  position: absolute;
  bottom: 12%;
  font-size: 40px;
  transform: translateX(-50%);
  transition: left 0.15s ease;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cr-chicken-running {
  animation: cr-bounce 0.2s ease infinite;
}

.cr-chicken-stunned {
  animation: cr-shake 0.1s ease infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)) brightness(0.6) sepia(1) hue-rotate(-30deg) saturate(3);
}

@keyframes cr-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-6px); }
}

@keyframes cr-shake {
  0%, 100% { transform: translateX(-50%) translateX(0); }
  25% { transform: translateX(-50%) translateX(-4px); }
  75% { transform: translateX(-50%) translateX(4px); }
}

/* Obstacles */
.cr-obstacle {
  position: absolute;
  font-size: 32px;
  transform: translateX(-50%);
  z-index: 1;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.25));
  transition: top 0.05s linear;
}

/* Overlays */
.cr-countdown {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
  font-weight: 800;
  color: white;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
  animation: cr-scale-in 0.4s ease;
}

@keyframes cr-scale-in {
  0% { transform: scale(2); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.cr-idle-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.cr-result-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 800;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 10;
  animation: cr-scale-in 0.4s ease;
}

.cr-result-win {
  color: #fbbf24;
  background: rgba(0, 0, 0, 0.3);
}

.cr-result-lose {
  color: #ef4444;
  background: rgba(0, 0, 0, 0.3);
}

/* Status */
.cr-status {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--purple);
  min-height: 24px;
}

/* Actions */
.cr-actions {
  display: flex;
  gap: 12px;
}

.cr-actions .bridge-btn {
  flex: 1;
}

@media (max-width: 768px) {
  .cr-section {
    padding: 70px 16px 32px;
  }

  .cr-container h1 {
    font-size: 28px;
  }

  .cr-score-value {
    font-size: 24px;
  }

  .cr-chicken {
    font-size: 34px;
  }

  .cr-obstacle {
    font-size: 28px;
  }
}
```

- [ ] **Step 2: Verify visual styling**

Run: `npm run dev`

Test the full game visually:
1. Track renders with green background and dashed lane dividers
2. Chicken emoji bounces while running
3. Obstacles have shadow and scroll smoothly
4. Timer turns red below 3 seconds with pulse animation
5. Progress bar fills with purple-to-pink gradient
6. Countdown numbers scale in
7. Win/Lose overlays display correctly
8. Scoreboard matches Tic Tac Toe style
9. Responsive on mobile viewport (toggle in devtools)

- [ ] **Step 3: Commit**

```bash
git add src/styles/sections.css
git commit -m "feat: add chicken racing CSS styles"
```

---

### Task 6: Polish and Final Verification

**Files:**
- Modify: `src/components/ChickenRacing.jsx` (if tweaks needed)

- [ ] **Step 1: Playtest and tune game balance**

Run: `npm run dev`

Play the game 5+ times and verify:
1. Tapping at a reasonable speed (~6-8 taps/sec) lets you finish in ~8-9 seconds
2. Getting stunned 2-3 times makes it very hard to win (adds challenge)
3. Obstacles don't spawn in impossible patterns (all 3 lanes blocked simultaneously)
4. Lane switching feels responsive
5. Timer, progress bar, and score all update correctly
6. Bridge instrumentation calls fire correctly (check browser console for `[bridge]` logs)

Adjust `TAP_BOOST`, `TARGET_DISTANCE`, or `DECELERATION` constants if the difficulty feels off.

- [ ] **Step 2: Run lint**

Run: `npx eslint src/components/ChickenRacing.jsx`

Fix any lint errors.

- [ ] **Step 3: Run build**

Run: `npm run build`

Verify the production build succeeds without errors.

- [ ] **Step 4: Commit any final tweaks**

```bash
git add -A
git commit -m "feat: polish chicken racing game balance and fix lint"
```
