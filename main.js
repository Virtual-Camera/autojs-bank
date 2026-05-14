/**
 * Main Script
 * Entry point for app
 */
let { sendLog } = require("./modules/log_axiom.js");
let ENV = require("./env.js");
sendLog("====================================================");
var Config = require("./modules/config.js");
var WSClient = require("./modules/websocket.js");

// 0. Check other script running
let id_now = engines.myEngine().id;
let id_all = engines.all();
sendLog("Id Now = " + id_now + ", Id All = " + id_all.length);
id_all.forEach((e) => {
  if (e.id !== id_now) {
    sendLog("Kill other script: " + e.id);
    e.forceStop();
  }
});

// 1. Hold screen + Run in background
console.show();
device.keepScreenOn(3600 * 10000);
// $power_manager.requestIgnoreBatteryOptimizations();

// 2. Get device info
var config = Config.getPusherConfig();
var mySN = Config.getDeviceSN();

sendLog("=== AUTO BANKING CLIENT start ===");
sendLog("API: " + ENV.API);
sendLog("Key: " + config.key);
sendLog("Cluster: " + config.cluster);
sendLog("Channel: " + config.channel);
sendLog("Device SN: " + mySN);
sendLog("=== AUTO BANKING CLIENT end ===");

// 3. Start WebSocket Client
WSClient.start(config, mySN);

// 4. Loop keep script alive
setInterval(() => {
  // Main thread alive
}, 60000);
