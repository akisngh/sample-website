# Chicken Racing Game — Design Spec

## Overview

A single-player vertical runner game where the player taps to make a chicken race upward along a 3-lane track, dodging obstacles, trying to reach the finish line before a 10-second countdown expires.

**Framework:** React 19 + Vite (pure CSS animations, no game libraries)
**Pattern:** Follows existing Tic Tac Toe game conventions

---

## Game Layout

- **Top bar:** Countdown timer (10s) + distance progress bar
- **Track area:** 3 vertical lanes, scrolling background with grass/road texture (CSS gradients)
- **Chicken:** Emoji-based (🐔), positioned near the bottom of the screen in one of the 3 lanes
- **Obstacles:** Emoji-based (🪨, 🚧, 🌾) that spawn at top and scroll downward
- **Bottom area:** Scoreboard (wins/losses) + controls hint ("Tap to run! Swipe to dodge!")

---

## Controls

### Tap to Run
- Each tap on the track area increases the chicken's speed/progress
- Faster tapping = more distance covered per second
- Chicken decelerates gradually when the player stops tapping

### Swipe to Dodge
- Swipe left/right to move the chicken between the 3 lanes
- Minimum swipe threshold to prevent accidental lane changes
- Lane change animation: ~150ms slide transition

### Collision
- Hitting an obstacle stuns the chicken for ~1 second
- During stun: no progress, chicken flashes red and shakes
- Game does not end on collision — player loses time instead

---

## Game Flow & States

### Pre-game
- Display "Ready? Tap to Start!" message
- First tap triggers a 3-2-1 countdown animation
- `Bridge.gameStarted()` called when race begins

### During Race
- 10-second countdown timer ticks down
- Obstacles spawn every 1-2 seconds in random lanes, scrolling downward
- Obstacle frequency increases slightly over time (difficulty ramp)
- Distance progress bar fills based on cumulative taps
- Target distance calibrated so a reasonably fast tapper finishes in ~8-9 seconds

### Game Over — Win
- Player reaches finish distance before timer hits 0
- "You Win!" celebration message with animation
- `Bridge.instrumentation("game_won", ...)` sent

### Game Over — Lose
- Timer reaches 0 before finish distance is reached
- "Time's Up!" message displayed
- `Bridge.instrumentation("game_lost", ...)` sent

### Post-game
- Scoreboard updates (wins/losses)
- "Play Again" and "Exit Game" buttons
- Exit: `Bridge.instrumentation("game_exit", ...)` then `Bridge.closeGame()`

---

## Score Reporting & Bridge Integration

Following the Tic Tac Toe pattern exactly:

```javascript
Bridge.instrumentation(eventName, {
  game: 'chicken_racing',
  score: wins,
  wins: wins,
  losses: losses,
  totalGames: wins + losses,
})
```

**Events:**
| Event | When |
|-------|------|
| `game_won` | Player reached finish in time |
| `game_lost` | Timer expired |
| `game_exit` | Player clicked Exit Game |

**Persistent state:** `Bridge.writeKey("scores")` / `Bridge.readKey("scores")` to persist win/loss counts across sessions (auto-prefixed with `web_game_`).

---

## Visual Style

Follows the existing design system (purple/pink gradients, card-based UI).

### Track
- Dark green background with lighter green lane dividers (CSS gradients)
- Dashed lane lines for road/path feel

### Chicken
- Chicken emoji (🐔) with CSS scaling
- Running animation: bounce/wobble on each tap
- Stun animation: red flash + shake on obstacle hit

### Obstacles
- Randomly selected emojis per spawn: 🪨 (rock), 🚧 (fence), 🌾 (hay bale)
- Slight shadow underneath for depth

### UI Elements
- Timer: bold countdown in top bar, turns red when < 3 seconds remaining
- Progress bar: purple-to-pink gradient fill (brand colors)
- Scoreboard: same gradient style as Tic Tac Toe scoreboard
- Buttons: reuse existing `.bridge-btn` styles
- 3-2-1 countdown: large centered numbers with scale-in animation

---

## Routing

- Route: `"chickenracing"` → `/sample-website/chickenracing`
- Added to `App.jsx` routing (pageToPath/pathToPage)
- Added as a feature card in `Features.jsx`

---

## File Structure

- `src/components/ChickenRacing.jsx` — Game component (logic, rendering, bridge integration)
- `src/styles/sections.css` — Game-specific styles appended to existing stylesheet

---

## Technical Notes

- Use `requestAnimationFrame` for the game loop (obstacle movement, timer updates)
- CSS transforms for obstacle scrolling and lane transitions (GPU-accelerated)
- Touch events: `touchstart` for taps, `touchmove`/`touchend` with delta calculation for swipe detection
- React state for game state management (useState/useEffect hooks)
- No external dependencies added
