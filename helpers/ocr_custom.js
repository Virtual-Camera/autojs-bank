let clickCustom = require("../helpers/click_custom.js")
let customShell = require("../helpers/custom_shell.js")

let name = "[OCR-Custom]: "
function norm(s) {
    return (s + "")
        .toLowerCase()
        .replace(/\s+/g, ""); // bỏ khoảng trắng
}

function removeAccents(str) {
    return str
        .normalize('NFD')                     // Tách dấu khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, '')      // Xóa các ký tự dấu phụ
        .replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Xử lý riêng chữ đ vì NFD không tách được
}
let arraySmallInArrayBig = function (arraySmall, arrayBig, print_log = false) {
    try {
        let res = true
        let lengthSmall = arraySmall.length
        let countFound = 0
        for (let x in arraySmall) {
            let text1 = arraySmall[x]
            let ok = arrayBig.some(x => norm(x).includes(norm(text1)));
            if (print_log) {
                LogRelay(name + "arraySmallInArrayBig: " + ok + "text1: " + text1)
            }
            if (ok) {
                countFound++
            }
        }
        if (countFound < lengthSmall) {
            return false
        }
        return true
    } catch (e) {
        LogRelay(name + "arraySmallInArrayBig: " + e)
        return false
    }

}

let waitTextOCR = function (text, xOffset = 0, yOffset = 0, needFound = 1, click = true, manyClick = 1, timeout = 10) {
    try {
        let found = 0
        for (let i = 0; i < timeout; i++) {
            LogRelay("Wait text: " + text + " count: " + i + "found:" + found + " needFound:" + needFound)
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
                    LogRelay(name + "Fount < needFound")
                }
            }
            sleep(1000)
        }
        return false
    } catch (e) {
        LogRelay(name + "waitTextOCR: " + e)
        return false
    }
}

let detectScreenOCR = function (config, needFound = 1, maxLoop = 10, print_log = false) {
    try {
        countFound = 0
        resFound = false
        for (let i = 0; i < maxLoop; i++) {
            _ = customShell.customShell("screencap -p /sdcard/tempscreen.png")
            let results = ocr("/sdcard/tempscreen.png");
            results = removeAccents(JSON.stringify(results))
            results = JSON.parse(results)
            LogRelay(name + "Detect screen OCR, i: " + i)
            LogRelay(name + "Detect screen OCR, results: " + JSON.stringify(results))
            for (let key in config) {
                text = config[key]['text']
                not_text = config[key]['not_text'] ?? []
                let ok = arraySmallInArrayBig(text, results)

                if (print_log) {
                    LogRelay("match =", ok);
                }
                if (ok) {
                    if (not_text.length > 0) {
                        // LogRelay(name + " Check not_text: " + not_text)
                        // let not_ok = arraySmallInArrayBig(not_text, results, 1)
                        // if (not_ok) {
                        //     LogRelay(name + "not_ok")
                        //     continue
                        // }
                        not_text.forEach(arr => {
                            let not_ok = arraySmallInArrayBig(arr, results, 1)
                            if (not_ok) {
                                LogRelay(name + "not_ok")
                                ok = false
                            }
                        });
                    }
                    if (ok) {
                        resFound = key
                        countFound++
                        break
                    }
                }
            }
            if (countFound >= needFound) {
                LogRelay(name + "Break because countFound >= needFound")
                break;
            }
            LogRelay(name + "countFound: " + countFound + " needFound: " + needFound)

        }
        LogRelay(name + "resFound: " + resFound)
        return resFound
    } catch (e) {
        LogRelay(name + "detectScreenOCR: " + e)
        LogRelay(e.stack)
        return false
    }
}

module.exports = {
    waitTextOCR,
    detectScreenOCR
}