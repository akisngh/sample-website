/**
 * bridge.js
 * ---------------------------------------------------------------------------
 * Web -> Native communication bridge for a JS game running inside an
 * Android WebView or an iOS WKWebView.
 *
 * Native side must register the bridge under these names:
 *   - Android: webView.addJavascriptInterface(obj, "MplAndroidBridge")
 *              where obj has @JavascriptInterface fun postMessage(message: String)
 *   - iOS:     contentController.add(handler, name: "iosBridge")
 *
 * Message contract (sent to native as a JSON string):
 *   { "type": "<TYPE>" }                         // no payload
 *   { "type": "<TYPE>", "payload": { ... } }     // with payload
 *
 * Supported types:
 *   CLOSE_GAME       - no payload
 *   GAME_STARTED     - no payload
 *   INSTRUMENTATION  - payload: { name: string, properties: object }
 *   DEEP_LINK        - payload: { action: string, actionParams: object }
 *
 * Usage (ES module):
 *   import Bridge from "./bridge.js";
 *   Bridge.gameStarted();
 *   Bridge.instrumentation("game_won", { amount: 10, isHof: true });
 *   Bridge.closeGame();
 *
 * Usage (script tag, no bundler):
 *   <script src="bridge.js"></script>
 *   <script> window.Bridge.gameStarted(); </script>
 *
 * ----------------------------- All Methods ----------------------------------
 *
 * 1. Bridge.gameStarted()
 *    Signal that the game UI is ready.
 *    Sends: { "type": "GAME_STARTED" }
 *    Example:
 *      Bridge.gameStarted();
 *
 * 2. Bridge.closeGame()
 *    Ask native to tear down the WebView.
 *    Sends: { "type": "CLOSE_GAME" }
 *    Example:
 *      Bridge.closeGame();
 *
 * 3. Bridge.instrumentation(name, properties)
 *    Send an analytics/instrumentation event to native.
 *    Sends: { "type": "INSTRUMENTATION", "payload": { "name": "...", "properties": {...} } }
 *    Example:
 *      Bridge.instrumentation("game_won", { amount: 10, isHof: true });
 *      Bridge.instrumentation("button_click", { button_id: "play", screen: "lobby" });
 *
 * 4. Bridge.deepLink(route, params)
 *    Ask native to open a deep link / navigate to a native screen.
 *    Sends: { "type": "DEEP_LINK", "payload": { "action": "OPEN_DEEP_LINK", "actionParams": { "actionType": "nav", "actionPayload": { "route": "...", "param": {...} } } } }
 *    Example:
 *      Bridge.deepLink("AddMoney", {});
 *      Bridge.deepLink("RummyGameList", { tab: "cash" });
 *
 * 5. Bridge.reload(url)
 *    Ask native to reload the WebView with a new URL.
 *    Sends: { "type": "RELOAD", "payload": { "url": "..." } }
 *    Example:
 *      Bridge.reload("https://example.com/game");
 *
 * 6. Bridge.readKey(key)
 *    Ask native to read a stored key. Response arrives via window.onNativeResponse.
 *    Keys are automatically prefixed with "web_game_" before sending to native.
 *    Sends: { "type": "READ_KEY", "payload": { "key": "web_game_<key>" } }
 *    Example:
 *      Bridge.readKey("user_preferences");
 *      // Sends key as "web_game_user_preferences"
 *
 * 7. Bridge.writeKey(key, value)
 *    Ask native to store a key-value pair.
 *    Keys are automatically prefixed with "web_game_" before sending to native.
 *    Sends: { "type": "WRITE_KEY", "payload": { "key": "web_game_<key>", "value": "..." } }
 *    Example:
 *      Bridge.writeKey("user_preferences", JSON.stringify({ theme: "dark" }));
 *      // Sends key as "web_game_user_preferences"
 *
 * 8. Bridge.isNative()
 *    Check if a native host (Android/iOS) is present. Returns boolean.
 *    Example:
 *      if (Bridge.isNative()) { console.log("Running inside WebView"); }
 *
 * 9. Bridge.send(type, payload)
 *    Low-level escape hatch to send a custom message type.
 *    Example:
 *      Bridge.send("CUSTOM_EVENT", { foo: "bar" });
 *
 * ---------------------------------------------------------------------------
 */
(function (root, factory) {
  // UMD-ish wrapper: attaches to window.Bridge and supports CommonJS/ES default.
  var Bridge = factory();
  root.Bridge = Bridge;
  if (typeof module === "object" && module.exports) {
    module.exports = Bridge;
    module.exports.default = Bridge;
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Known message types. Use these instead of raw strings at call sites. */
  var BridgeType = {
    CLOSE_GAME: "CLOSE_GAME",
    GAME_STARTED: "GAME_STARTED",
    INSTRUMENTATION: "INSTRUMENTATION",
    DEEP_LINK: "DEEP_LINK",
    RELOAD: "RELOAD",
    READ_KEY: "READ_KEY",
    WRITE_KEY: "WRITE_KEY",
  };

  /**
   * Resolve the platform transport once, lazily, and cache it.
   * Returns a function (jsonString) => void, or null if no native host.
   */
  var _post = null;
  var _resolved = false;

  function resolveTransport() {
    if (_resolved) return _post;
    _resolved = true;

    // Android: the injected interface itself exposes postMessage(String).
    if (typeof window !== "undefined" &&
        window.MplAndroidBridge &&
        typeof window.MplAndroidBridge.postMessage === "function") {
      _post = function (json) {
        window.MplAndroidBridge.postMessage(json);
      };
      return _post;
    }

    // iOS WKWebView: handler lives under webkit.messageHandlers.<name>.
    if (typeof window !== "undefined" &&
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.iosBridge) {
      _post = function (json) {
        window.webkit.messageHandlers.iosBridge.postMessage(json);
      };
      return _post;
    }

    // No native host (desktop browser during development).
    _post = null;
    return _post;
  }

  /**
   * Core send. Omits the "payload" key entirely when payload is undefined,
   * so payload-less types serialize as { "type": "..." }.
   *
   * @param {string} type     One of BridgeType.*
   * @param {object} [payload]
   */
  function send(type, payload) {
    var message = payload === undefined ? { type: type } : { type: type, payload: payload };

    var json;
    try {
      json = JSON.stringify(message);
    } catch (e) {
      // Most likely a circular reference or a BigInt in properties.
      console.error("[bridge] failed to serialize message:", e, message);
      return;
    }

    var post = resolveTransport();
    if (post) {
      try {
        post(json);
      } catch (e) {
        console.error("[bridge] native postMessage threw:", e, json);
      }
    } else {
      console.warn("[bridge] no native bridge — running in browser:", json);
    }
  }

  var Bridge = {
    /** Expose the type constants for callers that want them. */
    Type: BridgeType,

    /** Low-level escape hatch if you ever need to send a custom type. */
    send: send,

    /** CLOSE_GAME — ask native to tear down the WebView. No payload. */
    closeGame: function () {
      send(BridgeType.CLOSE_GAME);
    },

    /** GAME_STARTED — signal the game UI is ready. No payload. */
    gameStarted: function () {
      send(BridgeType.GAME_STARTED);
    },

    /**
     * INSTRUMENTATION — analytics event.
     * @param {string} name        Event name, e.g. "game_won".
     * @param {object} [properties] Arbitrary string->value bag.
     */
    instrumentation: function (name, properties) {
      send(BridgeType.INSTRUMENTATION, {
        name: name,
        properties: properties || {},
      });
    },

    /**
     * DEEP_LINK — ask native to open a deep link.
     * @param {string} route       Target route, e.g. "RummyGameList".
     * @param {object} [params]    Route parameters.
     */
    deepLink: function (route, params) {
      send(BridgeType.DEEP_LINK, {
        action: "OPEN_DEEP_LINK",
        actionParams: {
          actionType: "nav",
          actionPayload: {
            route: route,
            param: params || {},
          },
        },
      });
    },

    /**
     * RELOAD — ask native to reload the WebView with a new URL.
     * @param {string} url  The URL to load.
     */
    reload: function (url) {
      send(BridgeType.RELOAD, { url: url });
    },

    /**
     * READ_KEY — ask native to read a stored key.
     * Keys are automatically prefixed with "web_game_".
     * @param {string} key  The key to read (without prefix).
     */
    readKey: function (key) {
      send(BridgeType.READ_KEY, { key: "web_game_" + key });
    },

    /**
     * WRITE_KEY — ask native to store a key-value pair.
     * Keys are automatically prefixed with "web_game_".
     * @param {string} key    The key to write (without prefix).
     * @param {string} value  The value to store.
     */
    writeKey: function (key, value) {
      send(BridgeType.WRITE_KEY, { key: "web_game_" + key, value: value });
    },

    /**
     * True when a native host (Android or iOS) is present.
     * Useful to branch dev-only behavior.
     */
    isNative: function () {
      return resolveTransport() !== null;
    },
  };

  return Bridge;
});
