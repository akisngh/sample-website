import { useState, useEffect, useRef, useCallback } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

const TIMER_DURATION = 10
const TARGET_DISTANCE = 100
const TAP_BOOST = 2.5
const DECELERATION = 0.92
const OBSTACLE_SPEED = 3
const STUN_DURATION = 1000
const LANE_COUNT = 3
const COUNTDOWN_STEPS = [3, 2, 1, 'GO!']
const OBSTACLE_EMOJIS = ['🪨', '🚧', '🌾']

function ChickenRacing() {
  const [gameState, setGameState] = useState('idle')
  const [countdown, setCountdown] = useState(null)
  const [score, setScore] = useState({ wins: 0, losses: 0 })
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [distance, setDistance] = useState(0)
  const [lane, setLane] = useState(1)
  const [obstacles, setObstacles] = useState([])
  const [stunned, setStunned] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Tap to start!')

  const gameStateRef = useRef('idle')
  const distanceRef = useRef(0)
  const speedRef = useRef(0)
  const laneRef = useRef(1)
  const obstaclesRef = useRef([])
  const stunnedRef = useRef(false)
  const timerRef = useRef(TIMER_DURATION)
  const lastFrameRef = useRef(0)
  const rafRef = useRef(null)
  const spawnIntervalRef = useRef(null)
  const obstacleIdRef = useRef(0)
  const trackRef = useRef(null)
  const touchStartRef = useRef(null)

  // Keep refs in sync with state
  useEffect(() => { gameStateRef.current = gameState }, [gameState])
  useEffect(() => { distanceRef.current = distance }, [distance])
  useEffect(() => { laneRef.current = lane }, [lane])
  useEffect(() => { stunnedRef.current = stunned }, [stunned])

  function sendResult(eventName, s) {
    Bridge.instrumentation(eventName, {
      game: 'chicken_racing',
      score: s.wins,
      wins: s.wins,
      losses: s.losses,
      totalGames: s.wins + s.losses,
    })
  }

  const endGame = useCallback((result) => {
    const newState = result === 'won' ? 'won' : 'lost'
    gameStateRef.current = newState
    setGameState(newState)

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const newScore = result === 'won'
      ? { ...score, wins: score.wins + 1 }
      : { ...score, losses: score.losses + 1 }
    setScore(newScore)

    const msg = result === 'won' ? 'You made it! The chicken wins!' : 'Time\'s up! The chicken lost!'
    setStatusMsg(msg)

    sendResult(result === 'won' ? 'game_won' : 'game_lost', newScore)
  }, [score])

  const startGameLoop = useCallback(() => {
    lastFrameRef.current = performance.now()

    function loop(now) {
      if (gameStateRef.current !== 'playing') return

      const dt = Math.min((now - lastFrameRef.current) / 1000, 0.1)
      lastFrameRef.current = now

      // Update timer
      timerRef.current -= dt
      if (timerRef.current <= 0) {
        timerRef.current = 0
        setTimeLeft(0)
        endGame('lost')
        return
      }

      // Update speed and distance if not stunned
      if (!stunnedRef.current) {
        speedRef.current *= DECELERATION
        distanceRef.current += speedRef.current * dt * 60
        if (distanceRef.current >= TARGET_DISTANCE) {
          distanceRef.current = TARGET_DISTANCE
          setDistance(TARGET_DISTANCE)
          setTimeLeft(timerRef.current)
          endGame('won')
          return
        }
      }

      // Update obstacles
      const updatedObstacles = obstaclesRef.current
        .map(obs => ({ ...obs, y: obs.y + OBSTACLE_SPEED * dt * 60 }))
        .filter(obs => obs.y <= 110)
      obstaclesRef.current = updatedObstacles

      // Collision detection
      if (!stunnedRef.current) {
        for (const obs of obstaclesRef.current) {
          if (obs.lane === laneRef.current && obs.y >= 72 && obs.y <= 88) {
            stunnedRef.current = true
            setStunned(true)
            speedRef.current = 0
            setStatusMsg('Ouch! Stunned!')
            setTimeout(() => {
              stunnedRef.current = false
              setStunned(false)
              if (gameStateRef.current === 'playing') {
                setStatusMsg('Keep tapping!')
              }
            }, STUN_DURATION)
            break
          }
        }
      }

      // Sync state from refs
      setTimeLeft(timerRef.current)
      setDistance(distanceRef.current)
      setObstacles([...obstaclesRef.current])

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [endGame])

  const startCountdown = useCallback(() => {
    if (gameStateRef.current !== 'idle') return

    setGameState('countdown')
    gameStateRef.current = 'countdown'

    let step = 0
    setCountdown(COUNTDOWN_STEPS[step])

    const interval = setInterval(() => {
      step++
      if (step < COUNTDOWN_STEPS.length) {
        setCountdown(COUNTDOWN_STEPS[step])
      } else {
        clearInterval(interval)
        setCountdown(null)

        // Reset game values
        distanceRef.current = 0
        speedRef.current = 0
        laneRef.current = 1
        obstaclesRef.current = []
        stunnedRef.current = false
        timerRef.current = TIMER_DURATION
        obstacleIdRef.current = 0

        setDistance(0)
        setLane(1)
        setObstacles([])
        setStunned(false)
        setTimeLeft(TIMER_DURATION)
        setStatusMsg('Keep tapping!')

        setGameState('playing')
        gameStateRef.current = 'playing'

        Bridge.gameStarted()
        startGameLoop()
      }
    }, 600)
  }, [startGameLoop])

  // Obstacle spawning
  useEffect(() => {
    if (gameState === 'playing') {
      const startTime = Date.now()
      let spawnTimeout = null

      function scheduleSpawn() {
        const elapsed = (Date.now() - startTime) / 1000
        const delay = Math.max(800, 1500 - elapsed * 70)
        spawnTimeout = setTimeout(() => {
          if (gameStateRef.current !== 'playing') return

          const obsLane = Math.floor(Math.random() * LANE_COUNT)
          const emoji = OBSTACLE_EMOJIS[Math.floor(Math.random() * OBSTACLE_EMOJIS.length)]
          obstacleIdRef.current++
          const newObs = { id: obstacleIdRef.current, lane: obsLane, y: -10, emoji }
          obstaclesRef.current = [...obstaclesRef.current, newObs]

          scheduleSpawn()
        }, delay)
      }

      // Initial delay before first obstacle
      const initialTimeout = setTimeout(() => {
        if (gameStateRef.current === 'playing') {
          scheduleSpawn()
        }
      }, 1000)

      spawnIntervalRef.current = { initialTimeout, clear: () => { clearTimeout(initialTimeout); clearTimeout(spawnTimeout) } }

      return () => {
        clearTimeout(initialTimeout)
        if (spawnTimeout) clearTimeout(spawnTimeout)
      }
    }
  }, [gameState])

  // Keyboard handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (gameStateRef.current === 'idle') {
          startCountdown()
        } else if (gameStateRef.current === 'playing' && !stunnedRef.current) {
          speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (gameStateRef.current === 'playing') {
          const newLane = Math.max(0, laneRef.current - 1)
          laneRef.current = newLane
          setLane(newLane)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (gameStateRef.current === 'playing') {
          const newLane = Math.min(LANE_COUNT - 1, laneRef.current + 1)
          laneRef.current = newLane
          setLane(newLane)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [startCountdown])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function handleTouchStart(e) {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }

    if (gameStateRef.current === 'idle') {
      startCountdown()
    } else if (gameStateRef.current === 'playing' && !stunnedRef.current) {
      speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
    }
  }

  function handleTouchEnd(e) {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      if (gameStateRef.current === 'playing') {
        if (dx < 0) {
          const newLane = Math.max(0, laneRef.current - 1)
          laneRef.current = newLane
          setLane(newLane)
        } else {
          const newLane = Math.min(LANE_COUNT - 1, laneRef.current + 1)
          laneRef.current = newLane
          setLane(newLane)
        }
      }
    }

    touchStartRef.current = null
  }

  function handleClick() {
    if (gameStateRef.current === 'idle') {
      startCountdown()
    } else if (gameStateRef.current === 'playing' && !stunnedRef.current) {
      speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
    }
  }

  function handleReset() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (spawnIntervalRef.current && spawnIntervalRef.current.clear) {
      spawnIntervalRef.current.clear()
    }

    gameStateRef.current = 'idle'
    distanceRef.current = 0
    speedRef.current = 0
    laneRef.current = 1
    obstaclesRef.current = []
    stunnedRef.current = false
    timerRef.current = TIMER_DURATION
    obstacleIdRef.current = 0

    setGameState('idle')
    setCountdown(null)
    setTimeLeft(TIMER_DURATION)
    setDistance(0)
    setLane(1)
    setObstacles([])
    setStunned(false)
    setStatusMsg('Tap to start!')
  }

  function handleExit() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    Bridge.instrumentation('game_exit', {
      game: 'chicken_racing',
      score: score.wins,
      wins: score.wins,
      losses: score.losses,
      totalGames: score.wins + score.losses,
    })
    Bridge.closeGame()
  }

  const progressPct = Math.min(100, (distance / TARGET_DISTANCE) * 100)

  return (
    <section className="cr-section">
      <div className="cr-container">
        <h1>Chicken Racing</h1>
        <p className="cr-subtitle">Tap to run, swipe to dodge!</p>

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

        {(gameState === 'playing' || gameState === 'won' || gameState === 'lost') && (
          <div className="cr-hud">
            <div className={'cr-timer' + (timeLeft < 3 ? ' cr-timer-urgent' : '')}>
              {timeLeft.toFixed(1)}s
            </div>
            <div className="cr-progress-bar">
              <div className="cr-progress-fill" style={{ width: progressPct + '%' }} />
            </div>
          </div>
        )}

        <div
          className="cr-track"
          ref={trackRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
        >
          <div className="cr-lane-divider cr-lane-divider-1" />
          <div className="cr-lane-divider cr-lane-divider-2" />

          {gameState === 'countdown' && (
            <div className="cr-overlay cr-countdown-overlay">
              <span className="cr-countdown-text">{countdown}</span>
            </div>
          )}

          {gameState === 'idle' && (
            <div className="cr-overlay cr-idle-overlay">
              <span className="cr-idle-text">Tap to Start!</span>
            </div>
          )}

          {(gameState === 'won' || gameState === 'lost') && (
            <div className={'cr-overlay cr-result-overlay ' + (gameState === 'won' ? 'cr-result-win' : 'cr-result-lose')}>
              <span className="cr-result-text">
                {gameState === 'won' ? 'You Win!' : 'You Lose!'}
              </span>
            </div>
          )}

          {obstacles.map(obs => (
            <div
              className="cr-obstacle"
              key={obs.id}
              style={{
                left: (obs.lane * 33.33 + 16.66) + '%',
                top: obs.y + '%',
              }}
            >
              {obs.emoji}
            </div>
          ))}

          <div
            className={
              'cr-chicken' +
              (gameState === 'playing' && !stunned ? ' cr-chicken-running' : '') +
              (stunned ? ' cr-chicken-stunned' : '')
            }
            style={{ left: (lane * 33.33 + 16.66) + '%' }}
          >
            🐔
          </div>
        </div>

        <div className="cr-status">{statusMsg}</div>

        {(gameState === 'won' || gameState === 'lost') && (
          <div className="cr-actions">
            <button className="bridge-btn green" onClick={handleReset}>
              Play Again
            </button>
            <button className="bridge-btn red" onClick={handleExit}>
              Exit Game
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default ChickenRacing
