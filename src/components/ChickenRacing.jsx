import { useState, useEffect, useRef, useCallback } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

const TIMER_DURATION = 10
const TARGET_DISTANCE = 100
const TAP_BOOST = 2.5
const DECELERATION = 0.92
const OBSTACLE_SPEED = 2
const STUN_DURATION = 1000
const LANE_COUNT = 3
const COUNTDOWN_STEPS = [3, 2, 1, 'GO!']
const OBSTACLE_EMOJIS = ['🪨', '🚧', '🌾']

// Sound effects using Web Audio API
const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null

function playTone(freq, duration, type = 'square', volume = 0.15) {
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + duration)
}

const SFX = {
  tap: () => playTone(800, 0.06, 'square', 0.08),
  lane: () => playTone(500, 0.1, 'sine', 0.1),
  hit: () => {
    playTone(150, 0.3, 'sawtooth', 0.15)
    setTimeout(() => playTone(100, 0.2, 'sawtooth', 0.1), 50)
  },
  beep: () => playTone(600, 0.15, 'square', 0.12),
  go: () => playTone(1000, 0.25, 'square', 0.15),
  win: () => {
    playTone(523, 0.15, 'square', 0.12)
    setTimeout(() => playTone(659, 0.15, 'square', 0.12), 120)
    setTimeout(() => playTone(784, 0.15, 'square', 0.12), 240)
    setTimeout(() => playTone(1047, 0.3, 'square', 0.15), 360)
  },
  lose: () => {
    playTone(400, 0.2, 'sawtooth', 0.12)
    setTimeout(() => playTone(300, 0.2, 'sawtooth', 0.12), 180)
    setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.1), 360)
  },
}

// Background music — looping chiptune melody
const BGM = {
  nodes: null,
  playing: false,

  start() {
    if (!audioCtx || this.playing) return
    if (audioCtx.state === 'suspended') audioCtx.resume()
    this.playing = true

    // Melody notes (freq, duration in beats)
    const melody = [
      523, 523, 659, 659, 784, 784, 659, 0,
      587, 587, 523, 523, 440, 440, 523, 0,
      523, 659, 784, 1047, 784, 659, 523, 0,
      587, 659, 587, 523, 440, 523, 440, 0,
    ]
    // Bass line
    const bass = [
      131, 131, 131, 131, 165, 165, 165, 165,
      147, 147, 147, 147, 110, 110, 110, 110,
      131, 131, 131, 131, 165, 165, 165, 165,
      147, 147, 147, 147, 110, 110, 131, 131,
    ]

    const bpm = 180
    const beatLen = 60 / bpm
    const loopLen = melody.length * beatLen

    const melodyGain = audioCtx.createGain()
    melodyGain.gain.value = 0.07
    melodyGain.connect(audioCtx.destination)

    const bassGain = audioCtx.createGain()
    bassGain.gain.value = 0.06
    bassGain.connect(audioCtx.destination)

    // Schedule notes in a loop
    let startTime = audioCtx.currentTime + 0.05
    const scheduledOscs = []

    function scheduleLoop(offset) {
      melody.forEach((freq, i) => {
        if (freq === 0) return
        const osc = audioCtx.createOscillator()
        const env = audioCtx.createGain()
        osc.type = 'square'
        osc.frequency.value = freq
        const noteStart = offset + i * beatLen
        env.gain.setValueAtTime(0.07, noteStart)
        env.gain.exponentialRampToValueAtTime(0.001, noteStart + beatLen * 0.8)
        osc.connect(env)
        env.connect(melodyGain)
        osc.start(noteStart)
        osc.stop(noteStart + beatLen * 0.9)
        scheduledOscs.push(osc)
      })

      bass.forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        const env = audioCtx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = freq
        const noteStart = offset + i * beatLen
        env.gain.setValueAtTime(0.06, noteStart)
        env.gain.exponentialRampToValueAtTime(0.001, noteStart + beatLen * 0.9)
        osc.connect(env)
        env.connect(bassGain)
        osc.start(noteStart)
        osc.stop(noteStart + beatLen * 0.95)
        scheduledOscs.push(osc)
      })
    }

    // Schedule enough loops to cover the 10s race + buffer
    for (let l = 0; l < 4; l++) {
      scheduleLoop(startTime + l * loopLen)
    }

    this.nodes = { melodyGain, bassGain, oscs: scheduledOscs }
  },

  stop() {
    if (!this.playing || !this.nodes) return
    this.playing = false
    const now = audioCtx.currentTime
    this.nodes.melodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    this.nodes.bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    this.nodes.oscs.forEach(osc => {
      try { osc.stop(now + 0.35) } catch (_) {}
    })
    this.nodes = null
  },
}

function ChickenRacing() {
  const [gameState, setGameState] = useState('idle')
  const [countdown, setCountdown] = useState(null)
  const [score, setScore] = useState({ wins: 0, losses: 0 })
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION)
  const [distance, setDistance] = useState(0)
  const [lane, setLane] = useState(1)
  const [obstacles, setObstacles] = useState([])
  const [stunned, setStunned] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Ready? Tap to Start!')

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
    BGM.stop()

    const newScore = result === 'won'
      ? { ...score, wins: score.wins + 1 }
      : { ...score, losses: score.losses + 1 }
    setScore(newScore)

    const msg = result === 'won' ? 'You Win!' : "Time's Up!"
    setStatusMsg(msg)

    if (result === 'won') SFX.win()
    else SFX.lose()

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
            SFX.hit()
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
    SFX.beep()

    const interval = setInterval(() => {
      step++
      if (step < COUNTDOWN_STEPS.length) {
        setCountdown(COUNTDOWN_STEPS[step])
        if (COUNTDOWN_STEPS[step] === 'GO!') SFX.go()
        else SFX.beep()
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
        setStatusMsg('Tap to run! Swipe to dodge!')

        setGameState('playing')
        gameStateRef.current = 'playing'

        Bridge.gameStarted()
        BGM.start()
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
          SFX.tap()
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (gameStateRef.current === 'playing' && !stunnedRef.current) {
          SFX.lane()
          const newLane = Math.max(0, laneRef.current - 1)
          laneRef.current = newLane
          setLane(newLane)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (gameStateRef.current === 'playing' && !stunnedRef.current) {
          SFX.lane()
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
      BGM.stop()
    }
  }, [])

  function handleTouchStart(e) {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }

    if (gameStateRef.current === 'idle') {
      startCountdown()
    } else if (gameStateRef.current === 'playing' && !stunnedRef.current) {
      speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
      SFX.tap()
    }
  }

  function handleTouchEnd(e) {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      if (gameStateRef.current === 'playing' && !stunnedRef.current) {
        SFX.lane()
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

  function handleClick(e) {
    if (gameStateRef.current === 'idle') {
      startCountdown()
      return
    }
    if (gameStateRef.current === 'playing' && !stunnedRef.current) {
      speedRef.current = Math.min(speedRef.current + TAP_BOOST, 8)
      SFX.tap()

      // Click left/right third of track to switch lanes
      const rect = trackRef.current?.getBoundingClientRect()
      if (rect) {
        const x = e.clientX - rect.left
        const third = rect.width / 3
        if (x < third && laneRef.current > 0) {
          SFX.lane()
          const newLane = laneRef.current - 1
          laneRef.current = newLane
          setLane(newLane)
        } else if (x > third * 2 && laneRef.current < LANE_COUNT - 1) {
          SFX.lane()
          const newLane = laneRef.current + 1
          laneRef.current = newLane
          setLane(newLane)
        }
      }
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
    BGM.stop()

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
    setStatusMsg('Ready? Tap to Start!')
  }

  function handleExit() {
    BGM.stop()
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
                {gameState === 'won' ? 'You Win!' : "Time's Up!"}
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
