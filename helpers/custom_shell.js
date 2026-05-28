let { sendLog } = require("../modules/log_axiom.js");
let name = "[Custom-Shell]: "

let ShizukuShell = function (command) {
    sendLog(name + "ShizukuShell: " + command)
    let _ = shizuku(command)
    sendLog(name + "ShizukuShell result: " + JSON.stringify(_))
    if (!_.result) {
        sendLog(name + "ShizukuShell: run command failed, maybe Shizuku not running")
        return false
    }
    return _
}

let customShell = function (command) {
    sendLog(name + "customShell: " + command)
    let _
    _ = shell(command, true)

    if (_ && _.error) {
        if (String(_.error).includes('Cannot run program "su"')) {
            sendLog("Cannot run program 'su'")
            _ = ShizukuShell(command)
            return _
        } else {
            sendLog(_.error)
            return _
        }
    }
    return _
}

module.exports = {
    customShell,
    ShizukuShell
}
