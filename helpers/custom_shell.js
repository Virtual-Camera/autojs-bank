let { LogRelay } = require("../modules/log_relay.js");
let name = "[Custom-Shell]: "

let ShizukuShell = function (command) {
    LogRelay(name + "ShizukuShell: " + command)
    let _ = shizuku(command)
    LogRelay(name + "ShizukuShell result: " + JSON.stringify(_))
    if (!_.result) {
        LogRelay(name + "ShizukuShell: run command failed, maybe Shizuku not running")
        return false
    }
    return _
}

let customShell = function (command) {
    LogRelay(name + "customShell: " + command)
    let _
    _ = shell(command, true)

    if (_ && _.error) {
        if (String(_.error).includes('Cannot run program "su"')) {
            LogRelay("Cannot run program 'su'")
            _ = ShizukuShell(command)
            return _
        } else {
            LogRelay(_.error)
            return _
        }
    }
    return _
}

module.exports = {
    customShell,
    ShizukuShell
}
