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

const showText = function (text, x = 200, y = 500, size = 50, color = "#0000FF", timeout = 5000) {
    LogRelay(name + "Show text: " + text)
    var w = floaty.window(
        <frame gravity="center">
            <text id="text" textColor={color} textSize={size+"px"}>{text}</text>
        </frame>
    );
    w.setPosition(x, y);
    setTimeout(() => {
        w.close();
    }, timeout);
}

module.exports = {
    sleepCustom,
    showText
}