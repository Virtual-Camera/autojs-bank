let utils_log = globalThis.__LogAxiomSingleton__;
let sendLog = utils_log?.sendLog || null;

let name = "[Utils]: "

const sleepCustom = function (ms) {
    sendLog(name + "Sleep: " + ms)
    let start = Date.now();
    while (Date.now() - start < ms) {
        sendLog(name + "Sleep: " + (Date.now() - start))
        sleep(500);
    }
}

const showText = function (text, x = 200, y = 500, size = 50, color = "#0000FF", timeout = 5000) {
    sendLog(name + "Show text: " + text)
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