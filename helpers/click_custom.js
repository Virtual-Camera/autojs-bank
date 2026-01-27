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
            log(name + "Click custom adb root: " + cmd)
            _ = shell(cmd, true)
            log(_)
        } catch (e) {
            log(name + "Click custom shizuku: " + cmd)
            _ = shizuku(cmd)
            log(_)
        }
    } catch (e) {
        log(name + "clickCustom error: " + e)
        return false
    }
}
let clickCenter = function (e) {
    let center = e.center();
    let x = center.x;
    let y = center.y;
    log(name + "x: " + x + " y: " + y)
    sleep(1000)
    clickAuto(x, y)
}
let clickBoundsCustom = function (e, xOffset, yOffset) {
    try {
        log(name + "clickBoundsCustom")
        log(e)
        let bounds = e.bounds;
        log(bounds)
        let x = bounds.centerX() + xOffset;
        let y = bounds.centerY() + yOffset;
        log(name + "x: " + x + " y: " + y)
        sleep(1000)
        clickAuto(x, y)
    } catch (e) {
        log(name + "clickBoundsCustom error: " + e)
        return false
    }
}

let clickPct = function (px, py, longClick = false) {
    log(name + "clickPct: " + px + " " + py)
    let x = Math.floor(device.width * px / 100);
    let y = Math.floor(device.height * py / 100);
    log(name + "x: " + x + " y: " + y)
    clickAuto(x, y, longClick);
    return { x, y };
}

// let clickCenterByOCR = function (text) {
//     let img = images.captureScreen();
//     let results = ocr.detect(img);
//     log(results)
// }
module.exports = {
    clickCenter,
    clickBoundsCustom,
    clickPct
}