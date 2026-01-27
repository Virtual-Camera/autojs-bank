/**
 * Main Script
 * Entry point for app
 */
log("====================================================")
var Config = require("./modules/config.js");
var WSClient = require("./modules/websocket.js");

// 0. Check other script running
let id_now = engines.myEngine().id;
let id_all = engines.all();
log("Id Now = " + id_now + ", Id All = " + id_all.length);
id_all.forEach(e => {
    if (e.id !== id_now) {
        log("Kill other script: " + e.id);
        e.forceStop();
    }
})


// 1. Hold screen + Run in background
console.show();
device.keepScreenOn(3600 * 10000);
// $power_manager.requestIgnoreBatteryOptimizations();

// 2. Get device info
var config = Config.getPusherConfig();
var mySN = Config.getDeviceSN();

log("=== AUTO BANKING CLIENT start ===");
log("Key: " + config.key);
log("Cluster: " + config.cluster);
log("Channel: " + config.channel);
log("Device SN: " + mySN);


// 3. Start WebSocket Client
WSClient.start(config, mySN);

// 4. Loop keep script alive
setInterval(() => {
    // Main thread alive
}, 60000);
