let { customShell } = require("../helpers/custom_shell.js")

let name = "[Manager-Phone]: "

const change_nav_bar = function (type = 0) {
    try {
        LogRelay(name + "change_nav_bar: " + type)
        if (type == 0) {
            customShell("cmd overlay enable  --user 0 com.android.internal.systemui.navbar.threebutton", true)
            customShell("cmd overlay disable  --user 0 com.android.internal.systemui.navbar.gestural", true)
        } else {
            customShell("cmd overlay disable  --user 0 com.android.internal.systemui.navbar.threebutton", true)
            customShell("cmd overlay enable  --user 0 com.android.internal.systemui.navbar.gestural", true)
        }
    } catch (e) {
        LogRelay(name + "change_nav_bar error: " + e)
        return false
    }
}

const toggle_head_up_notification = function (value = 0) {
    try {
        LogRelay(name + "toggle_head_up_notification: " + value)
        customShell("settings put global heads_up_notifications_enabled " + value)
    } catch (e) {
        LogRelay(name + "toggle_head_up_notification error: " + e)
        return false
    }
}

const get_serial_number = function () {
    try {
        LogRelay(name + "get_serial_number")
        let res = customShell("getprop ro.serialno", true)
        if (res.code == 0) {
            let sn = res.result.trim()
            if (sn == "unknown") {
                return false
            }
            return sn
        }
        return false
    } catch (e) {
        LogRelay(name + "get_serial_number error: " + e)
        return false
    }
}


module.exports = {
    change_nav_bar,
    toggle_head_up_notification,
    get_serial_number
}