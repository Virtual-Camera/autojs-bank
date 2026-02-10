const KEY = "__LogRelaySingleton__";
let { get_serial_number } = require("../helpers/manager_phone.js")

if (!globalThis[KEY]) {
    let name = "[LogRelay]: ";
    log(name + "module loaded");
  // WebSocket phải là ws:// hoặc wss://
  let wsUrl = "wss://log.1s.money/api/logs";
  let ws = null;
  let queue = [];
  let sending = false;
  let connecting = false;
  let reconnectTimer = null;
  let reconnectDelay = 1000;
  let reconnectDelayMax = 10000;
  let retryTimer = null;
  let retryDelay = 500;
  let retryDelayMax = 5000;

  let _serial = null;
function getSerialLazy() {
  if (_serial != null) return _serial;
  try {
    _serial = get_serial_number();   // gọi khi LogRelay chạy, không phải lúc load module
  } catch (e) {
    _serial = "unknown";
  }
  return _serial;
}

  function connect() {
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    if (connecting) return;
    connecting = true;

    ws = new WebSocket(wsUrl);
    if (globalThis[KEY]) globalThis[KEY].ws = ws;
    ws.on("open", () => {
      connecting = false;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      reconnectDelay = 1000;
      retryDelay = 500;
      console.log(name + "WebSocket open");
      sendNext();
    });
    ws.on("message", (event) => {
      let data = JSON.parse(event.toString());
      let message = data.message;
      if (!message.includes("Log received")) {
        log("Message received: " + event.toString());
      }
    });
    ws.on("error", (e) => {
      connecting = false;
      console.error(name + "error: " + e);
      ws = null;
      scheduleReconnect();
      scheduleRetry();
    });
    ws.on("close", () => {
      connecting = false;
      console.log(name + "WebSocket closed");
      ws = null;
      scheduleReconnect();
      scheduleRetry();
    });
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 2, reconnectDelayMax);
  }

  function scheduleRetry() {
    if (retryTimer) return;
    if (!queue.length) return;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      sendNext();
    }, retryDelay);
    retryDelay = Math.min(retryDelay * 2, retryDelayMax);
  }

  connect();

  function sendNext() {
    if (sending) return;
    if (!queue.length) return;
    if (!ws) {
      log("WebSocket not connected, connecting...")
      connect();
      scheduleRetry();
      return;
    }

    sending = true;
    let payload = queue.shift();
    try {
      ws.send(payload);
      retryDelay = 500;
    } catch (e) {
      console.error(name + "send failed: " + e);
      queue.unshift(payload);
      scheduleReconnect();
      scheduleRetry();
    } finally {
      sending = false;
      if (queue.length) {
        setTimeout(sendNext, 0);
      }
    }
  }

  function LogRelay(text, level = "info", service = "autojs", meta = {}) {
    console.log(name + text);
    meta.deviceID = mySN;
    let msg = {
      type: "log",
      level,
      message: text,
      service,
      meta,
      logIdCustom: "autojs",
    };

    queue.push(JSON.stringify(msg));
    sendNext();
  }

  globalThis[KEY] = { LogRelay, ws };
}

// luôn export instance đã có (cũ hoặc mới)
module.exports = globalThis[KEY];