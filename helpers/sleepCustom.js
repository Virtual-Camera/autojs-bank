
let { sendLog } = require("../modules/log_axiom.js");
let name = "[SleepCustom]: "

module.exports = {
    sleepCustom: function (ms) {
        sendLog(name + "Sleep: " + ms)
        let start = Date.now();
        while (Date.now() - start < ms) {
            sendLog(name + "Sleep: " + (Date.now() - start))
            sleep(500);
        }
    }
}