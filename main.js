/**
 * Main Script
 * Entry point for app
 */
let { LogRelay } = require("./modules/log_relay.js");
let ENV = require("./env.js");
LogRelay("====================================================");
var Config = require("./modules/config.js");
var WSClient = require("./modules/websocket.js");

// 0. Check other script running
let id_now = engines.myEngine().id;
let id_all = engines.all();
LogRelay("Id Now = " + id_now + ", Id All = " + id_all.length);
id_all.forEach((e) => {
  if (e.id !== id_now) {
    LogRelay("Kill other script: " + e.id);
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

LogRelay("=== AUTO BANKING CLIENT start ===");
LogRelay("API: " + ENV.API);
LogRelay("Key: " + config.key);
LogRelay("Cluster: " + config.cluster);
LogRelay("Channel: " + config.channel);
LogRelay("Device SN: " + mySN);
LogRelay("=== AUTO BANKING CLIENT end ===");

// 3. Start WebSocket Client
WSClient.start(config, mySN);

// 4. Loop keep script alive
setInterval(() => {
  // Main thread alive
}, 60000);
