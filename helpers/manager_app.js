let { customShell } = require("../helpers/custom_shell.js")
let { change_video_camera } = require("../helpers/fake_camera.js")

let manager_app_log = globalThis.__LogAxiomSingleton__;
let sendLog = manager_app_log?.sendLog || null;


let name = "[ManagerApp]: "
let closeApp = function (pkg) {
    try {
        sendLog(name + "closeApp: " + pkg)
        customShell("am force-stop " + pkg, true)
    } catch (e) {
        sendLog(name + "closeApp error: " + e)
        return false
    }
}
let openApp = function (pkg, activity = "", close = true, useMonkey = false, pressHome = true) {
    try {
        sendLog(name + "openApp: clearing video camera")
        change_video_camera("clear")
        sendLog(name + "openApp: " + pkg + "/" + activity)
        if (close) {
            closeApp(pkg)
        }
        if (pressHome) {
            customShell("input keyevent KEYCODE_HOME")
        }
        if (useMonkey) {
            customShell("monkey -p " + pkg + " 1")
        } else {
            customShell("am start -n " + pkg + "/" + activity)
        }
    } catch (e) {
        sendLog(name + "openApp error: " + e)
        return false
    }
}

module.exports = {
    closeApp,
    openApp
}