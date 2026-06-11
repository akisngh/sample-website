import { useState, useEffect } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

function BridgeTest() {
  const [log, setLog] = useState([])
  const [kvKey, setKvKey] = useState('amit')
  const [kvValue, setKvValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      Bridge.gameStarted()
      setLog((prev) => [...prev, { action: 'gameStarted() [auto]', result: '{"type":"GAME_STARTED"}', time: new Date().toLocaleTimeString() }])
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = Bridge.onResponse((response) => {
      const time = new Date().toLocaleTimeString()
      const json = JSON.stringify(response)

      if (response.type === 'READ_KEY_RESPONSE') {
        setKvValue(response.payload?.value ?? '')
        setLog((prev) => [...prev, { action: 'Native → READ_KEY_RESPONSE', result: json, time, isResponse: true }])
      } else if (response.type === 'WRITE_KEY_RESPONSE') {
        setLog((prev) => [...prev, { action: 'Native → WRITE_KEY_RESPONSE', result: json, time, isResponse: true }])
      } else {
        setLog((prev) => [...prev, { action: 'Native → ' + response.type, result: json, time, isResponse: true }])
      }
    })
    return unsubscribe
  }, [])

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
    Bridge.deepLink('AddMoney', {})
    addLog('deepLink("AddMoney")', '{"type":"DEEP_LINK","payload":{"action":"OPEN_DEEP_LINK","actionParams":{"actionType":"nav","actionPayload":{"route":"AddMoney","param":{}}}}}')
  }

  function handleReload() {
    const url = 'https://akisngh.github.io/sample-website/'
    Bridge.reload(url)
    addLog('reload()', '{"type":"RELOAD","payload":{"url":"' + url + '"}}')
  }

  function handleCheckNative() {
    const result = Bridge.isNative()
    addLog('isNative()', String(result))
  }

  function handleReadKey() {
    Bridge.readKey(kvKey)
    addLog('readKey("' + kvKey + '")', JSON.stringify({ type: 'READ_KEY', payload: { key: kvKey, value: kvValue } }))
  }

  function handleWriteKey() {
    Bridge.writeKey(kvKey, kvValue)
    addLog('writeKey("' + kvKey + '")', JSON.stringify({ type: 'WRITE_KEY', payload: { key: kvKey, value: kvValue } }))
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
          <button className="bridge-btn cyan" onClick={handleReload}>Reload</button>
          <button className="bridge-btn teal" onClick={handleCheckNative}>Check Native</button>
        </div>

        <div className="bridge-kv-section">
          <h3>Key-Value Store</h3>
          <div className="bridge-kv-inputs">
            <label className="bridge-kv-label">
              Key
              <input
                type="text"
                className="bridge-kv-input"
                value={kvKey}
                onChange={(e) => setKvKey(e.target.value)}
                placeholder="Enter key"
              />
            </label>
            <label className="bridge-kv-label">
              Value
              <input
                type="text"
                className="bridge-kv-input"
                value={kvValue}
                onChange={(e) => setKvValue(e.target.value)}
                placeholder="Enter value"
              />
            </label>
          </div>
          <div className="bridge-kv-buttons">
            <button className="bridge-btn pink" onClick={handleWriteKey}>Write Key</button>
            <button className="bridge-btn indigo" onClick={handleReadKey}>Read Key</button>
          </div>
        </div>

        {log.length > 0 && (
          <div className="bridge-log">
            <h3>Event Log</h3>
            <div className="bridge-log-entries">
              {log.map((entry, i) => (
                <div className={'bridge-log-entry' + (entry.isResponse ? ' native-response' : '')} key={i}>
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
