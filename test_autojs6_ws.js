/**
 * AutoJS6 WebSocket Test Script (Auto-Reconnect & Heartbeat)
 * Target: ws://47.130.43.143:8787
 */

console.show();
device.keepScreenOn(3600 * 1000); // Giữ màn hình sáng (tuỳ chọn)
// Hoặc dùng WakeLock để chạy ngầm (quan trọng)
// $power_manager.requestIgnoreBatteryOptimizations(); // Yêu cầu bỏ qua tối ưu pin (cần quyền)

let st = storages.create("ENV");
st.put("PUSHER_KEY", "3fa7886c712372501725");
st.put("PUSHER_CLUSTER", "ap1");
st.put("PUSHER_CHANNEL", "SelltoolOutBank");

let key = st.get("PUSHER_KEY");
let cluster = st.get("PUSHER_CLUSTER");
let channel = st.get("PUSHER_CHANNEL");

var url = "ws://47.130.43.143:8787?key=" + key + "&cluster=" + cluster + "&channel=" + channel;

var reconnectDelay = 5000; // 5 giây
var heartbeatInterval = 30000; // 30 giây
var ws = null;
var heartbeatTimer = null;
var isConnecting = false;

function connect() {
    if (isConnecting) return;
    isConnecting = true;
    log("Connecting to WebSocket...");

    try {
        ws = web.newWebSocket(url);

        ws.on("open", function (res, socket) {
            log("WebSocket Connected!");
            isConnecting = false;
            // Bắt đầu gửi tim (heartbeat)
            startHeartbeat();
        });

        ws.on("text", function (text, socket) {
            if (text === 'pong') {
                // log("Heartbeat ACK"); // Tùy chọn: in ra để debug
                return;
            }
            log("Received: " + text);
            // Xử lý JSON nếu cần
        });

        ws.on("closing", function (code, reason, socket) {
            log("WS Closing: " + code + " - " + reason);
            stopHeartbeat();
        });

        ws.on("closed", function (code, reason, socket) {
            log("WS Closed: " + code + " - " + reason);
            isConnecting = false;
            stopHeartbeat();
            scheduleReconnect();
        });

        ws.on("failure", function (t, res, socket) {
            log("WS Failure: " + t);
            isConnecting = false;
            stopHeartbeat();
            scheduleReconnect();
        });

    } catch (e) {
        log("Error creating WebSocket: " + e);
        isConnecting = false;
        scheduleReconnect();
    }
}

function scheduleReconnect() {
    log("Reconnecting in " + (reconnectDelay / 1000) + "s...");
    setTimeout(function () {
        connect();
    }, reconnectDelay);
}

function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(function () {
        log("Sending heartbeat...");
        if (ws && ws.isOpen && ws.isOpen()) { // Kiểm tra trạng thái connected (tuỳ API AutoJS)
            // Lưu ý: api check open có thể khác nhau, thường gửi luôn, nếu lỗi thì vào failure
            try {
                ws.send("ping");
            } catch (e) {
                log("Ping failed: " + e);
            }
        } else if (ws) {
            // Thử gửi đại, nếu ws object hỗ trợ send
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

// Start
connect();

// Giữ script sống
setInterval(() => { }, 60000);
