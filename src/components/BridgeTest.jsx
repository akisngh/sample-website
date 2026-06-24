import { useState, useEffect } from 'react'
import '../bridge.js'

const Bridge = window.Bridge

function BridgeTest({ onNavigate }) {
  const [log, setLog] = useState([])
  const [kvKey, setKvKey] = useState('amit')
  const [kvValue, setKvValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      Bridge.gameStarted()
      setLog((prev) => [...prev, { action: 'gameStarted() [auto]', result: '{"type":"GAME_STARTED"}', time: new Date().toLocaleTimeString() }])
      if (onNavigate) onNavigate('tictactoe')
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    window.onNativeResponse = function (message) {
      try {
        const data = typeof message === 'string' ? JSON.parse(message) : message
        const time = new Date().toLocaleTimeString()
        const json = JSON.stringify(data)

        if (data.type === 'READ_KEY_RESPONSE') {
          const rawValue = data.payload?.value ?? ''
          setKvValue(rawValue)
          let parsedKv = null
          try { parsedKv = JSON.parse(rawValue) } catch (_) {}
          setLog((prev) => [...prev, { action: 'Native → READ_KEY_RESPONSE', result: json, time, isResponse: true, parsedKv }])
        } else if (data.type === 'WRITE_KEY_RESPONSE') {
          setLog((prev) => [...prev, { action: 'Native → WRITE_KEY_RESPONSE', result: json, time, isResponse: true }])
        } else {
          setLog((prev) => [...prev, { action: 'Native → ' + data.type, result: json, time, isResponse: true }])
        }
      } catch (e) {
        console.error('[bridge] failed to handle native response:', e, message)
      }
    }
    return () => { window.onNativeResponse = undefined }
  }, [])

  function addLog(action, result) {
    setLog((prev) => [...prev, { action, result, time: new Date().toLocaleTimeString() }])
  }

  function handleGameStarted() {
    Bridge.gameStarted()
    addLog('gameStarted()', '{"type":"GAME_STARTED"}')
    if (onNavigate) onNavigate('tictactoe')
  }

  function handleCloseGame() {
    Bridge.closeGame()
    addLog('closeGame()', '{"type":"CLOSE_GAME"}')
  }


  const randomEvents = [
    { name: 'button_click', props: () => ({ button_id: 'btn_' + Math.floor(Math.random() * 100), screen: 'home' }) },
    { name: 'page_view', props: () => ({ page: ['lobby', 'profile', 'wallet', 'leaderboard'][Math.floor(Math.random() * 4)], duration_ms: Math.floor(Math.random() * 5000) }) },
    { name: 'purchase', props: () => ({ item: ['gems', 'coins', 'pass', 'ticket'][Math.floor(Math.random() * 4)], amount: Math.floor(Math.random() * 500) + 10, currency: 'INR' }) },
    { name: 'level_complete', props: () => ({ level: Math.floor(Math.random() * 50) + 1, score: Math.floor(Math.random() * 10000), stars: Math.floor(Math.random() * 3) + 1 }) },
    { name: 'error_occurred', props: () => ({ code: [400, 401, 403, 500, 502][Math.floor(Math.random() * 5)], endpoint: '/api/' + ['user', 'game', 'match', 'wallet'][Math.floor(Math.random() * 4)] }) },
    { name: 'share_content', props: () => ({ method: ['whatsapp', 'copy_link', 'instagram', 'twitter'][Math.floor(Math.random() * 4)], content_type: 'score' }) },
  ]

  function handleInstrumentation() {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)]
    const properties = event.props()
    Bridge.instrumentation(event.name, properties)
    addLog('instrumentation("' + event.name + '")', JSON.stringify({ type: 'INSTRUMENTATION', payload: { name: event.name, properties } }))
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
          <button className="bridge-btn orange" onClick={handleInstrumentation}>Instrumentation</button>
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
                  {entry.parsedKv && typeof entry.parsedKv === 'object' && (
                    <div className="log-kv-table">
                      {Object.entries(entry.parsedKv).map(([k, v]) => (
                        <div className="log-kv-row" key={k}>
                          <span className="log-kv-key">{k}</span>
                          <span className="log-kv-value">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
