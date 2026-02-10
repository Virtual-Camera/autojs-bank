let { LogRelay } = require("../modules/log_relay.js");
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
            LogRelay(name + "Click custom adb root: " + cmd)
            _ = shell(cmd, true)
            LogRelay(name + "Click custom adb root result: " + JSON.stringify(_))
        } catch (e) {
            LogRelay(name + "Click custom shizuku: " + cmd)
            _ = shizuku(cmd)
            LogRelay(name + "Click custom shizuku result: " + JSON.stringify(_))
        }
    } catch (e) {
        LogRelay(name + "clickCustom error: " + e)
        return false
    }
}
let clickCenter = function (e) {
    let center = e.center();
    let x = center.x;
    let y = center.y;
    LogRelay(name + "x: " + x + " y: " + y)
    sleep(1000)
    clickAuto(x, y)
}
let clickBoundsCustom = function (e, xOffset, yOffset) {
    try {
        LogRelay(name + "clickBoundsCustom")
        LogRelay(e)
        let bounds = e.bounds;
        LogRelay(bounds)
        let x = bounds.centerX() + xOffset;
        let y = bounds.centerY() + yOffset;
        LogRelay(name + "x: " + x + " y: " + y)
        sleep(1000)
        clickAuto(x, y)
    } catch (e) {
        LogRelay(name + "clickBoundsCustom error: " + e)
        return false
    }
}

let clickPct = function (px, py, longClick = false) {
    LogRelay(name + "clickPct: " + px + " " + py)
    let x = Math.floor(device.width * px / 100);
    let y = Math.floor(device.height * py / 100);
    LogRelay(name + "x: " + x + " y: " + y)
    clickAuto(x, y, longClick);
    return { x, y };
}

let clickInputText = function (text) {
    LogRelay(name + "clickInputText: " + text)
    _ = shell("input text " + text, true)
    LogRelay(name + "clickInputText result: " + JSON.stringify(_))
}

// let clickCenterByOCR = function (text) {
//     let img = images.captureScreen();
//     let results = ocr.detect(img);
//     LogRelay(results)
// }
module.exports = {
    clickCenter,
    clickBoundsCustom,
    clickPct,
    clickInputText
}