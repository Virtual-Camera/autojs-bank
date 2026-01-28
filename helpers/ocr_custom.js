let clickCustom = require("../helpers/click_custom.js")
let customShell = require("../helpers/custom_shell.js")

let name = "[OCR-Custom]: "
function norm(s) {
    return (s + "")
        .toLowerCase()
        .replace(/\s+/g, ""); // bỏ khoảng trắng
}
let arraySmallInArrayBig = function (arraySmall, arrayBig) {
    try {
        let res = true
        let lengthSmall = arraySmall.length
        let countFound = 0
        log(name + "arraySmallInArrayBig: " + JSON.stringify(arraySmall) + " " + JSON.stringify(arrayBig))
        for (let x in arraySmall) {
            let text1 = arraySmall[x]
            let ok = arrayBig.some(x => norm(x).includes(norm(text1)));
            log(name + "arraySmallInArrayBig: " + ok + "text1: " + text1)
            if (ok) {
                countFound++
            }
        }
        if (countFound < lengthSmall) {
            return false
        }
        return true
    } catch (e) {
        log(name + "arraySmallInArrayBig: " + e)
        return false
    }

}

let waitTextOCR = function (text, xOffset = 0, yOffset = 0, needFound = 1, click = true, manyClick = 1, timeout = 10) {
    try {
        let found = 0
        for (let i = 0; i < timeout; i++) {
            log("Wait text: " + text + " count: " + i + "found:" + found + " needFound:" + needFound)
            // images.requestScreenCapture();
            // let img = images.captureScreen();
            // let results = ocr.detect(img);
            path = "/sdcard/tempscreen.png"
            _ = customShell.customShell("screencap -p " + path)
            let img = images.read(path);
            let results = ocr.detect(img);
            let target = results.find(item => item.label.includes(text));
            if (target) {
                found++
                if (found >= needFound) {
                    if (click) {
                        for (let j = 0; j < manyClick; j++) {
                            clickCustom.clickBoundsCustom(target, xOffset, yOffset)
                        }
                    }
                    break;
                } else {
                    log(name + "Fount < needFound")
                }
            }
            sleep(1000)
        }
        return false
    } catch (e) {
        log(name + "waitTextOCR: " + e)
        return false
    }
}

let detectScreenOCR = function (config, needFound = 1, maxLoop = 10) {
    try {
        countFound = 0
        resFound = false
        for (let i = 0; i < maxLoop; i++) {
            _ = customShell.customShell("screencap -p /sdcard/tempscreen.png")
            let results = ocr("/sdcard/tempscreen.png");
            log(name + "Detect screen OCR, i: " + i)
            // log(results)
            for (let name in config) {
                text = config[name]['text']
                not_text = config[name]['not_text'] ?? []
                let ok = arraySmallInArrayBig(text, results)

                log("match =", ok);
                if (ok) {
                    if (not_text.length > 0) {
                        log(name + "Check not_text")
                        let not_ok = arraySmallInArrayBig(not_text, results)
                        if (not_ok) {
                            log(name + "not_ok")
                            continue
                        }
                    }
                    resFound = name
                    countFound++
                    break
                }

            }
            if (countFound >= needFound) {
                log(name + "Break because countFound >= needFound")
                break;
            }
            log(name + "countFound: " + countFound + " needFound: " + needFound)

        }
        log(name + "resFound: " + resFound)
        return resFound
    } catch (e) {
        log(name + "detectScreenOCR: " + e)
        return false
    }
}

module.exports = {
    waitTextOCR,
    detectScreenOCR
}