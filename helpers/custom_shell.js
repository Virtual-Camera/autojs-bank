
const { logAxiom: logAxiom } = globalThis.__LogAxiomSingleton__ || {};
let name = "[Custom-Shell]: "

function log_axiom(message) {
    if (logAxiom) {
        logAxiom(message)
    } else {
        log(message)
    }
}

let ShizukuShell = function (command) {
    log_axiom(name + "ShizukuShell: " + command)
    let _ = shizuku(command)
    log_axiom(name + "ShizukuShell result: " + JSON.stringify(_))
    if (!_.result) {
        log_axiom(name + "ShizukuShell: run command failed, maybe Shizuku not running")
        return false
    }
    return _
}

let customShell = function (command) {
    try {
        log_axiom(name + "customShell: " + command)
        let _
        _ = shell(command, true)
    
        if (_ && _.error) {
            if (String(_.error).includes('Cannot run program "su"')) {
                log_axiom("Cannot run program 'su'")
                _ = ShizukuShell(command)
                return _
            } else {
                log_axiom(_.error)
                return _
            }
        }
        return _
    } catch (e) {
        log_axiom(name + "customShell error: " + JSON.stringify(e))
        return false
    }
    
}

module.exports = {
    customShell,
    ShizukuShell
}
