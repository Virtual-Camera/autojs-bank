/**
 * WebSocket Client Module
 * Quản lý kết nối, heartbeat và lọc bản tin
 */
let { LogRelay } = require("../modules/log_relay.js");

var Processor = require("./processor.js");

var ws = null;
var heartbeatTimer = null;
var isConnecting = false;
var reconnectDelay = 5000;
var heartbeatInterval = 30000;
var currentConfig = null;
var currentDeviceSN = null;

var WS_URL_BASE = "ws://47.130.43.143:8787";

function connect(config, deviceSN) {
    currentConfig = config;
    currentDeviceSN = deviceSN;

    if (isConnecting) return;
    isConnecting = true;

    // Build URL
    // ws://IP:8787?key=...&cluster=...&channel=...
    var url = WS_URL_BASE +
        "?key=" + config.key +
        "&cluster=" + config.cluster +
        "&channel=" + config.channel;

    LogRelay("Connecting WS to channel: " + config.channel);

    try {
        ws = web.newWebSocket(url);

        setupListeners(ws);

    } catch (e) {
        LogRelay("Error creating WebSocket: " + e);
        isConnecting = false;
        scheduleReconnect();
    }
}

function setupListeners(socket) {
    socket.on("open", function (res, ws) {
        LogRelay("WS Open: Connected!");
        isConnecting = false;
        startHeartbeat();
    });

    socket.on("text", function (text, ws) {
        if (text === 'pong') {
            // LogRelay("Heartbeat OK");
            return;
        }

        try {
            var json = JSON.parse(text);

            // Log raw để debug
            // LogRelay("Raw: " + text);

            // Kiểm tra cấu trúc bản tin
            // Cấu trúc mong đợi: { channel, event, data: { customData: { sn: "xxx" } } }
            if (json.data && json.data.customData && json.data.customData.sn) {
                var receivedSN = json.data.customData.sn;

                LogRelay("Received SN: " + receivedSN); // Debug

                if (receivedSN === currentDeviceSN) {
                    LogRelay("--> MATCH SN (" + currentDeviceSN + "). Processing...");
                    // Gọi sang module Processor
                    Processor.handle(json);
                } else {
                    LogRelay("--> MISMATCH SN. Device SN: " + currentDeviceSN + ", Message SN: " + receivedSN);
                }
            } else {
                // Các tin hệ thống hoặc không đúng format
                if (json.event) LogRelay("Event: " + json.event);
            }

        } catch (e) {
            LogRelay("Error parsing JSON: " + e);
        }
    });

    socket.on("closing", function (code, reason, ws) {
        LogRelay("WS Closing: " + reason);
        stopHeartbeat();
    });

    socket.on("closed", function (code, reason, ws) {
        LogRelay("WS Closed. Reconnecting...");
        isConnecting = false;
        stopHeartbeat();
        scheduleReconnect();
    });

    socket.on("failure", function (t, res, ws) {
        LogRelay("WS Error: " + t);
        isConnecting = false;
        stopHeartbeat();
        scheduleReconnect();
    });
}

function scheduleReconnect() {
    setTimeout(function () {
        if (currentConfig && currentDeviceSN) {
            connect(currentConfig, currentDeviceSN);
        }
    }, reconnectDelay);
}

function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(function () {
        if (ws) {
            try { ws.send("ping"); } catch (e) { }
        }
    }, heartbeatInterval);
}

function stopHeartbeat() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

module.exports = {
    start: connect
};
