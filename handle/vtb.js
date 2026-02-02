let managerPhone = require("../helpers/manager_phone.js")
let managerApp = require("../helpers/manager_app.js")
let requestCustom = require("../helpers/request_custom.js")
let clickCustom = require("../helpers/click_custom.js")
let elementSe = require("../helpers/element_se.js")
const { customShell } = require("../helpers/custom_shell.js")
let ocrCustom = require("../helpers/ocr_custom.js")
let { sleepCustom } = require("../helpers/sleepCustom.js")
let { change_ramdom_video, change_video_camera } = require("../helpers/fake_camera.js")


let name = "[VTB]: "
let pkg = 'com.vietinbank.ipay'
let elmHome = "com.vietinbank.ipay:id/llHomeLoyalty"
let elmBottom = "com.vietinbank.ipay:id/wrap_bottom"
let elmLoading = "com.vietinbank.ipay:id/animation_view"
let wait, _, res
let force_stop = false
let count_fake_camera = 0

let config_detect = {
    "homepage": {
        "text": [
            "Login", "Transfer", "Topup"
        ]
    },
    "vietnamese": {
        "text": [
            "Dang nhap"
        ]
    },
    "popup_confirm": {
        "text": [
            "Authenticate", "transaction"
        ],
        "not_text": [
            ["Help", "English"]
        ]
    },
    "tab_profile": {
        "text": [
            "Login", "Network", "FAQ"
        ]
    },
    "tab_login": {
        "text": [
            "Login", "Password"
        ]
    },
    "confirm_transfer": {
        "text": [
            "Confirm", "OTP"
        ],
        "not_text": [
            ["successful"]
        ]
    },
    "success_transfer": {
        "text": [
            "successful", "agree", "Authentication"
        ]
    },
    "kyc": {
        "text": [
            "Face", "Pay", "Authentication"
        ]
    }
}

VTBClass = function (data_pusher) {
    try {
        this.data_pusher = data_pusher
        this.statusRunning = ""
        this.id_row = data_pusher['idRow']
    } catch (error) {
        LogRelay(name + "Error constructor: " + error)
        LogRelay(error.stack)
    }
}
VTBClass.prototype.handleClick = function (action) {
    try {
        LogRelay(name + "handle click: " + action)
        switch (action) {
            case "vietnamese":
                LogRelay(name + " Change app language to English")
                this.statusRunning = "stop"
                break;
            case "popup_confirm":
                LogRelay(name + " Action popup confirm")
                clickCustom.clickPct(80, 58, true)
                break;
            case "tab_profile":
                LogRelay(name + " Click tab profile")
                clickCustom.clickPct(50, 40, true)
                sleepCustom(1000)
                break;
            case "homepage":
                LogRelay(name + " Action homepage")
                clickCustom.clickPct(90, 95, true)
                sleepCustom(1000)
                break;
            case "confirm_transfer":
                LogRelay(name + " Action confirm transfer")
                clickCustom.clickPct(80, 93, true)
                LogRelay("WAIT GONEEEEEEEEEEEEEEEE")
                elementSe.wait_gone_id(elmLoading)
                LogRelay("WAIT GONEEEEEEEEEEEEEEEE22222222222222")

                break;
            case "tab_login":
                LogRelay(name + " Action tab login")
                managerApp.openApp(pkg, "", true, true)
                sleepCustom(3000)
                LogRelay("?????????????????????????????????")
                this.statusRunning = "stop"
                break;
            case "success_transfer":
                LogRelay(name + " Action success transfer")
                requestCustom.transferLogSet(this.id_row, "705")
                this.statusRunning = "stop"
                break;
            case "kyc":
                LogRelay(name + " Action kyc")
                elementSe.wait_gone_id("com.vietinbank.ipay:id/fFacePayCamera", 20000)
                break;

        }
    } catch (error) {
        LogRelay(name + "Error handleClick: " + error)
        LogRelay(error.stack)
    }
}
VTBClass.prototype.handleTransfer = function () {
    try {
        LogRelay(name + "Handle transfer");
        managerPhone.change_nav_bar(1)
        requestCustom.transferLogSet(this.id_row, "111")

        let data = requestCustom.transferLogCheck(this.id_row, "111", 30000, 30)
        if (!data) {
            LogRelay(name + "data not found 32423ew")
            return
        }
        if (data.status != "700") {
            LogRelay(name + "data status != 700")
            return
        }
        requestCustom.transferLogSet(this.id_row, "701")
        let _ = managerApp.openApp(pkg, "", true, true)
        LogRelay(name + "openApp123: " + _)
        change_ramdom_video([this.data_pusher.username, "VTB"])
        count_fake_camera += 1
        sleepCustom(2000)
        for (let i = 0; i < 10; i++) {
            sleepCustom(1000)
            if (this.statusRunning == "stop") {
                LogRelay(name + "statusRunning == stop")
                managerApp.closeApp(pkg)
                break;
            }
            if (force_stop) {
                LogRelay(name + "force_stop == true")
                managerApp.closeApp(pkg)
                force_stop = false
                break;
            }
            detect = ocrCustom.detectScreenOCR(config_detect, 1, 5)
            this.handleClick(detect)
        }


    } catch (error) {
        LogRelay(name + "Error handleTransfer: " + error)
        LogRelay(error.stack)
    }
}

module.exports = VTBClass
