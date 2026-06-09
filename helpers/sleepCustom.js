
let { sendLog } = require("../modules/log_axiom.js");
let name = "[SleepCustom]: "

module.exports = {
    sleepCustom: function (ms) {
        sendLog(name + "Sleep: " + ms)
        let start = Date.now();
        while (Date.now() - start < ms) {
            sleep(500);
        }
    }
}