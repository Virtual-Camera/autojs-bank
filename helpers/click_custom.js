let { sendLog } = require("../modules/log_axiom.js");
let _ = null
let name = "[Click-Custom]:"
let clickAuto = function (x, y, longClick = false) {
    try {
        let cmd = ""
        if (longClick) {
            cmd = "input swipe " + x + " " + y + " " + x + " " + y + " 500"
        } else {
            cmd = "input tap " + x + " " + y
        }
        try {
            sendLog(name + "Click custom adb root: " + cmd)
            _ = shell(cmd, true)
            sendLog(name + "Click custom adb root result: " + JSON.stringify(_))
        } catch (e) {
            sendLog(name + "Click custom shizuku: " + cmd)
            _ = shizuku(cmd)
            sendLog(name + "Click custom shizuku result: " + JSON.stringify(_))
        }
    } catch (e) {
        sendLog(name + "clickCustom error: " + e)
        return false
    }
}
let clickCenter = function (e) {
    let center = e.center();
    let x = center.x;
    let y = center.y;
    sendLog(name + "x: " + x + " y: " + y)
    sleep(1000)
    clickAuto(x, y)
}
let clickBoundsCustom = function (e, xOffset, yOffset) {
    try {
        sendLog(name + "clickBoundsCustom")
        sendLog(e)
        let bounds = e.bounds;
        sendLog(bounds)
        let x = bounds.centerX() + xOffset;
        let y = bounds.centerY() + yOffset;
        sendLog(name + "x: " + x + " y: " + y)
        sleep(1000)
        clickAuto(x, y)
    } catch (e) {
        sendLog(name + "clickBoundsCustom error: " + e)
        return false
    }
}

let clickPct = function (px, py, longClick = false) {
    sendLog(name + "clickPct: " + px + " " + py)
    let x = Math.floor(device.width * px / 100);
    let y = Math.floor(device.height * py / 100);
    sendLog(name + "x: " + x + " y: " + y)
    clickAuto(x, y, longClick);
    return { x, y };
}

let clickInputText = function (text) {
    sendLog(name + "clickInputText: " + text)
    _ = shell("input text " + text, true)
    sendLog(name + "clickInputText result: " + JSON.stringify(_))
}

// let clickCenterByOCR = function (text) {
//     let img = images.captureScreen();
//     let results = ocr.detect(img);
//     sendLog(results)
// }
module.exports = {
    clickCenter,
    clickBoundsCustom,
    clickPct,
    clickInputText
}