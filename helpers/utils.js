let { LogRelay } = require("../modules/log_relay.js");

let name = "[Utils]: "

const sleepCustom = function (ms) {
    LogRelay(name + "Sleep: " + ms)
    let start = Date.now();
    while (Date.now() - start < ms) {
        LogRelay(name + "Sleep: " + (Date.now() - start))
        sleep(500);
    }
}
module.exports = {
    sleepCustom
}