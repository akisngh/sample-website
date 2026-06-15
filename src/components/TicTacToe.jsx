import { useState, useEffect } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function getWinner(squares) {
  for (const [a, b, c] of WINNING_LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { mark: squares[a], line: [a, b, c] }
    }
  }
  return null
}

function getBotMove(squares) {
  // Try to win
  for (const [a, b, c] of WINNING_LINES) {
    const cells = [squares[a], squares[b], squares[c]]
    if (cells.filter((v) => v === 'O').length === 2 && cells.includes(null)) {
      return [a, b, c][cells.indexOf(null)]
    }
  }
  // Block player
  for (const [a, b, c] of WINNING_LINES) {
    const cells = [squares[a], squares[b], squares[c]]
    if (cells.filter((v) => v === 'X').length === 2 && cells.includes(null)) {
      return [a, b, c][cells.indexOf(null)]
    }
  }
  // Take center
  if (!squares[4]) return 4
  // Take a corner
  for (const i of [0, 2, 6, 8]) {
    if (!squares[i]) return i
  }
  // Take any
  return squares.indexOf(null)
}

function TicTacToe() {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [score, setScore] = useState({ player: 0, bot: 0, draw: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [statusMsg, setStatusMsg] = useState('Your turn (X)')
  const [winLine, setWinLine] = useState(null)

  // Bot plays after player
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const move = getBotMove(squares)
        if (move === -1) return
        const next = [...squares]
        next[move] = 'O'
        setSquares(next)
        setIsPlayerTurn(true)

        const win = getWinner(next)
        if (win) {
          setWinLine(win.line)
          setGameOver(true)
          const newScore = { ...score, bot: score.bot + 1 }
          setScore(newScore)
          setStatusMsg('Bot wins!')
          sendResult('game_lost', newScore)
        } else if (next.every(Boolean)) {
          setGameOver(true)
          const newScore = { ...score, draw: score.draw + 1 }
          setScore(newScore)
          setStatusMsg("It's a draw!")
          sendResult('game_draw', newScore)
        } else {
          setStatusMsg('Your turn (X)')
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isPlayerTurn, gameOver, squares, score])

  function sendResult(eventName, s) {
    Bridge.instrumentation(eventName, {
      game: 'tic_tac_toe',
      score: s.player,
      wins: s.player,
      losses: s.bot,
      draws: s.draw,
      totalGames: s.player + s.bot + s.draw,
    })
  }

  function handleClick(i) {
    if (squares[i] || !isPlayerTurn || gameOver) return
    const next = [...squares]
    next[i] = 'X'
    setSquares(next)

    const win = getWinner(next)
    if (win) {
      setWinLine(win.line)
      setGameOver(true)
      const newScore = { ...score, player: score.player + 1 }
      setScore(newScore)
      setStatusMsg('You win!')
      sendResult('game_won', newScore)
    } else if (next.every(Boolean)) {
      setGameOver(true)
      const newScore = { ...score, draw: score.draw + 1 }
      setScore(newScore)
      setStatusMsg("It's a draw!")
      sendResult('game_draw', newScore)
    } else {
      setIsPlayerTurn(false)
      setStatusMsg('Bot thinking...')
    }
  }

  function handleReset() {
    setSquares(Array(9).fill(null))
    setIsPlayerTurn(true)
    setGameOver(false)
    setStatusMsg('Your turn (X)')
    setWinLine(null)
  }

  function handleExit() {
    Bridge.instrumentation('game_exit', {
      game: 'tic_tac_toe',
      score: score.player,
      wins: score.player,
      losses: score.bot,
      draws: score.draw,
      totalGames: score.player + score.bot + score.draw,
    })
    Bridge.closeGame()
  }

  return (
    <section className="ttt-section">
      <div className="ttt-container">
        <h1>Tic Tac Toe</h1>
        <p className="ttt-subtitle">Play against the bot — scores sent to native</p>

        <div className="ttt-scoreboard">
          <div className="ttt-score-item ttt-score-player">
            <span className="ttt-score-label">You (X)</span>
            <span className="ttt-score-value">{score.player}</span>
          </div>
          <div className="ttt-score-item ttt-score-draw">
            <span className="ttt-score-label">Draw</span>
            <span className="ttt-score-value">{score.draw}</span>
          </div>
          <div className="ttt-score-item ttt-score-bot">
            <span className="ttt-score-label">Bot (O)</span>
            <span className="ttt-score-value">{score.bot}</span>
          </div>
        </div>

        <div className="ttt-status">{statusMsg}</div>

        <div className="ttt-board">
          {squares.map((val, i) => (
            <button
              className={
                'ttt-cell' +
                (val === 'X' ? ' x' : val === 'O' ? ' o' : '') +
                (winLine && winLine.includes(i) ? ' win' : '')
              }
              key={i}
              onClick={() => handleClick(i)}
              disabled={gameOver || !isPlayerTurn || !!val}
            >
              {val}
            </button>
          ))}
        </div>

        <div className="ttt-actions">
          <button className="bridge-btn green" onClick={handleReset}>
            {gameOver ? 'Play Again' : 'Reset'}
          </button>
          <button className="bridge-btn red" onClick={handleExit}>
            Exit Game
          </button>
        </div>
      </div>

    </section>
  )
}

export default TicTacToe
