let { customShell } = require("../helpers/custom_shell.js")

let name = "[Manager-Phone]: "

const change_nav_bar = function (type = 0) {
    try {
        log(name + "change_nav_bar: " + type)
        if (type == 0) {
            customShell("cmd overlay enable  --user 0 com.android.internal.systemui.navbar.threebutton", true)
            customShell("cmd overlay disable  --user 0 com.android.internal.systemui.navbar.gestural", true)
        } else {
            customShell("cmd overlay disable  --user 0 com.android.internal.systemui.navbar.threebutton", true)
            customShell("cmd overlay enable  --user 0 com.android.internal.systemui.navbar.gestural", true)
        }
    } catch (e) {
        log(name + "change_nav_bar error: " + e)
        return false
    }
}

const toggle_head_up_notification = function (value = 0) {
    try {
        log(name + "toggle_head_up_notification: " + value)
        customShell("settings put global heads_up_notifications_enabled " + value)
    } catch (e) {
        log(name + "toggle_head_up_notification error: " + e)
        return false
    }
}


module.exports = {
    change_nav_bar,
    toggle_head_up_notification
}