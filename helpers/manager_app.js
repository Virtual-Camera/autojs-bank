let { customShell } = require("../helpers/custom_shell.js")
let { change_video_camera } = require("../helpers/fake_camera.js")

let name = "[ManagerApp]: "
let closeApp = function (pkg) {
    try {
        LogRelay(name + "closeApp: " + pkg)
        customShell("am force-stop " + pkg, true)
    } catch (e) {
        LogRelay(name + "closeApp error: " + e)
        return false
    }
}
let openApp = function (pkg, activity = "", close = true, useMonkey = false, pressHome = true) {
    try {
        LogRelay(name + "openApp: clearing video camera")
        change_video_camera("clear")
        LogRelay(name + "openApp: " + pkg + "/" + activity)
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
        LogRelay(name + "openApp error: " + e)
        return false
    }
}

module.exports = {
    closeApp,
    openApp
}