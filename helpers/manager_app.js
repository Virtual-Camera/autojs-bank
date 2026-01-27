let { customShell } = require("../helpers/custom_shell.js")
let { change_video_camera } = require("../helpers/fake_camera.js")

let name = "[ManagerApp]: "
let closeApp = function (pkg) {
    try {
        log(name + "closeApp: " + pkg)
        customShell("am force-stop " + pkg, true)
    } catch (e) {
        log(name + "closeApp error: " + e)
        return false
    }
}
let openApp = function (pkg, activity, close = true) {
    try {
        log(name + "openApp: clearing video camera")
        change_video_camera("clear")
        log(name + "openApp: " + pkg + "/" + activity)
        if (close) {
            closeApp(pkg)
        }
        customShell("am start -n " + pkg + "/" + activity, true)
    } catch (e) {
        log(name + "openApp error: " + e)
        return false
    }
}
module.exports = {
    closeApp,
    openApp
}