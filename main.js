/**
 * Main Script
 * Entry point for app
 */
require("./modules/log_axiom.js");
const axiom = globalThis.__LogAxiomSingleton__;
// const { sendLog: logAxiom } = globalThis.__LogAxiomSingleton__ || {};
log("axiom: " + JSON.stringify(axiom));
log(axiom.sn)
log(shizuku.isRunning())
let ENV = require("./env.js");
axiom.sendLog("====================================================");
var Config = require("./modules/config.js");
var WSClient = require("./modules/websocket.js");

// 0. Check other script running
let id_now = engines.myEngine().id;
let id_all = engines.all();
axiom.sendLog("Id Now = " + id_now + ", Id All = " + id_all.length);
id_all.forEach((e) => {
  if (e.id !== id_now) {
    axiom.sendLog("Kill other script: " + e.id);
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

axiom.sendLog("=== AUTO BANKING CLIENT start ===");
axiom.sendLog("API: " + ENV.API);
axiom.sendLog("Key: " + config.key);
axiom.sendLog("Cluster: " + config.cluster);
axiom.sendLog("Channel: " + config.channel);
axiom.sendLog("Device SN: " + mySN);
axiom.sendLog("=== AUTO BANKING CLIENT end ===");

// 3. Start WebSocket Client
WSClient.start(config, mySN);

// 4. Loop keep script alive
setInterval(() => {
  // Main thread alive
}, 60000);
