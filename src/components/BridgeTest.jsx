import { useState } from 'react'
import Bridge from '../bridge.js'

function BridgeTest() {
  const [log, setLog] = useState([])

  function addLog(action, result) {
    setLog((prev) => [...prev, { action, result, time: new Date().toLocaleTimeString() }])
  }

  function handleGameStarted() {
    Bridge.gameStarted()
    addLog('gameStarted()', '{"type":"GAME_STARTED"}')
  }

  function handleCloseGame() {
    Bridge.closeGame()
    addLog('closeGame()', '{"type":"CLOSE_GAME"}')
  }

  function handleGameWon() {
    Bridge.instrumentation('game_won', { amount: 10, isHof: true })
    addLog('instrumentation("game_won")', '{"type":"INSTRUMENTATION","payload":{"name":"game_won","properties":{"amount":10,"isHof":true}}}')
  }

  function handleGameLost() {
    Bridge.instrumentation('game_lost', { amount: 0, isHof: false })
    addLog('instrumentation("game_lost")', '{"type":"INSTRUMENTATION","payload":{"name":"game_lost","properties":{"amount":0,"isHof":false}}}')
  }

  function handleDeepLink() {
    Bridge.deepLink('RummyGameList', { deepLinkGameId: 1000215, screenName: 'LEADERBOARD' })
    addLog('deepLink("RummyGameList")', '{"type":"DEEP_LINK","payload":{"action":"OPEN_DEEP_LINK","actionParams":{"actionType":"nav","actionPayload":{"route":"RummyGameList","param":{"deepLinkGameId":1000215,"screenName":"LEADERBOARD"}}}}}')
  }

  function handleCheckNative() {
    const result = Bridge.isNative()
    addLog('isNative()', String(result))
  }

  return (
    <section className="bridge-section">
      <div className="bridge-container">
        <h1>Bridge Test</h1>
        <p className="bridge-subtitle">Test native WebView communication</p>

        <div className="bridge-buttons">
          <button className="bridge-btn green" onClick={handleGameStarted}>Game Started</button>
          <button className="bridge-btn red" onClick={handleCloseGame}>Close Game</button>
          <button className="bridge-btn purple" onClick={handleGameWon}>Game Won</button>
          <button className="bridge-btn orange" onClick={handleGameLost}>Game Lost</button>
          <button className="bridge-btn blue" onClick={handleDeepLink}>Deep Link</button>
          <button className="bridge-btn teal" onClick={handleCheckNative}>Check Native</button>
        </div>

        {log.length > 0 && (
          <div className="bridge-log">
            <h3>Event Log</h3>
            <div className="bridge-log-entries">
              {log.map((entry, i) => (
                <div className="bridge-log-entry" key={i}>
                  <span className="log-time">{entry.time}</span>
                  <span className="log-action">{entry.action}</span>
                  <code className="log-result">{entry.result}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default BridgeTest
