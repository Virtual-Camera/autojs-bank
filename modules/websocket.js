/**
 * WebSocket Client Module
 * Quản lý kết nối, heartbeat và lọc bản tin
 */
let { sendLog } = require("../modules/log_axiom.js");

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

    sendLog("Connecting WS to channel: " + config.channel);

    try {
        ws = web.newWebSocket(url);

        setupListeners(ws);

    } catch (e) {
        sendLog("Error creating WebSocket: " + e);
        isConnecting = false;
        scheduleReconnect();
    }
}

function setupListeners(socket) {
    socket.on("open", function (res, ws) {
        sendLog("WS Open: Connected!");
        isConnecting = false;
        startHeartbeat();
    });

    socket.on("text", function (text, ws) {
        if (text === 'pong') {
            // sendLog("Heartbeat OK");
            return;
        }

        try {
            var json = JSON.parse(text);

            // Log raw để debug
            // sendLog("Raw: " + text);

            // Kiểm tra cấu trúc bản tin
            // Cấu trúc mong đợi: { channel, event, data: { customData: { sn: "xxx" } } }
            if (json.data && json.data.customData && json.data.customData.sn) {
                var receivedSN = json.data.customData.sn;

                sendLog("Received SN: " + receivedSN); // Debug

                if (receivedSN === currentDeviceSN) {
                    sendLog("--> MATCH SN (" + currentDeviceSN + "). Processing...");
                    // Gọi sang module Processor
                    Processor.handle(json);
                } else {
                    sendLog("--> MISMATCH SN. Device SN: " + currentDeviceSN + ", Message SN: " + receivedSN);
                }
            } else {
                // Các tin hệ thống hoặc không đúng format
                if (json.event) sendLog("Event: " + json.event);
            }

        } catch (e) {
            sendLog("Error parsing JSON: " + e);
        }
    });

    socket.on("closing", function (code, reason, ws) {
        sendLog("WS Closing: " + reason);
        stopHeartbeat();
    });

    socket.on("closed", function (code, reason, ws) {
        sendLog("WS Closed. Reconnecting...");
        isConnecting = false;
        stopHeartbeat();
        scheduleReconnect();
    });

    socket.on("failure", function (t, res, ws) {
        sendLog("WS Error: " + t);
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
