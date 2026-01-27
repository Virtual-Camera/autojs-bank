let name = "[Custom-Shell]: "

let ShizukuShell = function (command) {
    log(name + "ShizukuShell: " + command)
    let _ = shizuku(command)
    log(name + "ShizukuShell result: " + JSON.stringify(_))
    if (!_.result) {
        log(name + "ShizukuShell: run command failed, maybe Shizuku not running")
        return false
    }
    return _
}

let customShell = function (command) {
    log(name + "customShell: " + command)
    let _
    _ = shell(command, true)

    if (_ && _.error) {
        if (String(_.error).includes('Cannot run program "su"')) {
            log("Cannot run program 'su'")
            _ = ShizukuShell(command)
            return _
        } else {
            log(_.error)
            return _
        }
    }
    return _
}

module.exports = {
    customShell,
    ShizukuShell
}
