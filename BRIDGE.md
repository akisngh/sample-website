# Bridge.js - Web to Native Communication

Bridge module for JS games running inside an Android WebView or iOS WKWebView.

## Native Setup

| Platform | Registration |
|----------|-------------|
| **Android** | `webView.addJavascriptInterface(obj, "MplAndroidBridge")` — obj must have `@JavascriptInterface fun postMessage(message: String)` |
| **iOS** | `contentController.add(handler, name: "iosBridge")` |

## Message Format

All messages are sent to native as JSON strings:

```json
{ "type": "<TYPE>" }                         // no payload
{ "type": "<TYPE>", "payload": { ... } }     // with payload
```

## Import

**ES Module:**
```js
import Bridge from "./bridge.js";
```

**Script tag (no bundler):**
```html
<script src="bridge.js"></script>
<script> window.Bridge.gameStarted(); </script>
```

---

## Methods

### 1. `Bridge.gameStarted()`

Signal that the game UI is ready.

**Sends:**
```json
{ "type": "GAME_STARTED" }
```

**Example:**
```js
Bridge.gameStarted();
```

---

### 2. `Bridge.closeGame()`

Ask native to tear down the WebView.

**Sends:**
```json
{ "type": "CLOSE_GAME" }
```

**Example:**
```js
Bridge.closeGame();
```

---

### 3. `Bridge.instrumentation(name, properties)`

Send an analytics/instrumentation event to native.

| Param | Type | Description |
|-------|------|-------------|
| `name` | `string` | Event name, e.g. `"game_won"` |
| `properties` | `object` | Arbitrary key-value bag (optional) |

**Sends:**
```json
{
  "type": "INSTRUMENTATION",
  "payload": {
    "name": "game_won",
    "properties": { "amount": 10, "isHof": true }
  }
}
```

**Examples:**
```js
Bridge.instrumentation("game_won", { amount: 10, isHof: true });
Bridge.instrumentation("button_click", { button_id: "play", screen: "lobby" });
```

---

### 4. `Bridge.deepLink(route, params)`

Ask native to open a deep link / navigate to a native screen.

| Param | Type | Description |
|-------|------|-------------|
| `route` | `string` | Target route, e.g. `"AddMoney"` |
| `params` | `object` | Route parameters (optional) |

**Sends:**
```json
{
  "type": "DEEP_LINK",
  "payload": {
    "action": "OPEN_DEEP_LINK",
    "actionParams": {
      "actionType": "nav",
      "actionPayload": {
        "route": "AddMoney",
        "param": {}
      }
    }
  }
}
```

**Examples:**
```js
Bridge.deepLink("AddMoney", {});
Bridge.deepLink("RummyGameList", { tab: "cash" });
```

---

### 5. `Bridge.reload(url)`

Ask native to reload the WebView with a new URL.

| Param | Type | Description |
|-------|------|-------------|
| `url` | `string` | The URL to load |

**Sends:**
```json
{
  "type": "RELOAD",
  "payload": { "url": "https://example.com/game" }
}
```

**Example:**
```js
Bridge.reload("https://example.com/game");
```

---

### 6. `Bridge.readKey(key)`

Ask native to read a stored key. The response arrives asynchronously via `window.onNativeResponse`.

> **Note:** Keys are automatically prefixed with `"web_game_"` before sending to native. You pass the key without the prefix.

| Param | Type | Description |
|-------|------|-------------|
| `key` | `string` | The key to read (without `web_game_` prefix) |

**Sends:**
```json
{ "type": "READ_KEY", "payload": { "key": "web_game_user_preferences" } }
```

**Response (via `window.onNativeResponse`):**
```json
{ "type": "READ_KEY_RESPONSE", "payload": { "value": "..." } }
```

**Example:**
```js
window.onNativeResponse = function (message) {
  const data = JSON.parse(message);
  if (data.type === "READ_KEY_RESPONSE") {
    console.log("Value:", data.payload.value);
  }
};
// Passes "user_preferences" → native receives "web_game_user_preferences"
Bridge.readKey("user_preferences");
```

---

### 7. `Bridge.writeKey(key, value)`

Ask native to store a key-value pair.

> **Note:** Keys are automatically prefixed with `"web_game_"` before sending to native. You pass the key without the prefix.

| Param | Type | Description |
|-------|------|-------------|
| `key` | `string` | The key to write (without `web_game_` prefix) |
| `value` | `string` | The value to store |

**Sends:**
```json
{ "type": "WRITE_KEY", "payload": { "key": "web_game_user_preferences", "value": "{\"theme\":\"dark\"}" } }
```

**Response (via `window.onNativeResponse`):**
```json
{ "type": "WRITE_KEY_RESPONSE" }
```

**Example:**
```js
// Passes "user_preferences" → native receives "web_game_user_preferences"
Bridge.writeKey("user_preferences", JSON.stringify({ theme: "dark" }));
```

---

### 8. `Bridge.isNative()`

Check if a native host (Android/iOS) is present. Returns `true` inside a WebView, `false` in a regular browser.

**Example:**
```js
if (Bridge.isNative()) {
  console.log("Running inside WebView");
} else {
  console.log("Running in browser — no native bridge");
}
```

---

### 9. `Bridge.send(type, payload)`

Low-level escape hatch to send a custom message type not covered by the convenience methods above.

| Param | Type | Description |
|-------|------|-------------|
| `type` | `string` | Custom message type |
| `payload` | `object` | Payload object (optional) |

**Example:**
```js
Bridge.send("CUSTOM_EVENT", { foo: "bar" });
```

---

## Quick Reference

| Method | Type Sent | Has Payload |
|--------|-----------|-------------|
| `gameStarted()` | `GAME_STARTED` | No |
| `closeGame()` | `CLOSE_GAME` | No |
| `instrumentation(name, props)` | `INSTRUMENTATION` | Yes |
| `deepLink(route, params)` | `DEEP_LINK` | Yes |
| `reload(url)` | `RELOAD` | Yes |
| `readKey(key)` | `READ_KEY` | Yes |
| `writeKey(key, value)` | `WRITE_KEY` | Yes |
| `isNative()` | — | — (returns boolean) |
| `send(type, payload)` | Custom | Optional |
