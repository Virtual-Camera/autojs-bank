let clickCustom = require("../helpers/click_custom.js")
let managerApp = require("../helpers/manager_app.js")
let managerPhone = require("../helpers/manager_phone.js")
let ocrCustom = require("../helpers/ocr_custom.js")
let requestCustom = require("../helpers/request_custom.js")
let { customShell } = require("../helpers/custom_shell.js")
let { change_ramdom_video, change_video_camera } = require("../helpers/fake_camera.js")
let elementSe = require("../helpers/element_se.js")

let _;
let name = "[VCB]: "
let pkg = "com.VCB"
let activity = ".ui.activities.splash.SplashActivity"
let rs_id_kyc = "com.VCB:id/frOverlay"
let rs_id_loadding = "com.VCB:id/progressLoading"
let force_stop = false
var config_detect = {
    "homepage": {
        "text": [
            "Forgot", "Welcome", "Password"
        ]
    },
    "noti_balance": {
        "text": [
            "information", "balance", "view"
        ]
    },
    "noti_noti": {
        "text": [
            "Agree", "Reject"
        ],
        "not_text": [
            ["OTP", "PIN"],
            ["Close"]
        ]
    },
    "transfer_expired": {
        "text": [
            "expired", "transaction", "has"
        ]
    },
    "transfer_invalid": {
        "text": [
            "Invalid", "transaction", "Close"
        ]
    },
    "input_pin": {
        "text": [
            "PIN", "OTP"
        ]
    },
    "confirm_transfer": {
        "text": [
            "Confirm"
        ],
        "not_text": [
            ["Success", "Close"]
        ]
    },
    "transfer_success": {
        "text": [
            "Success", "Close"
        ]
    },
    "kyc": {
        "text": [
            "face", "frame"
        ]
    },
    "vietnamese": {
        "text": [
            "ENG", "Tạo OTP"
        ]
    }
}

const clickFromHomepage = function () {
    clickCustom.clickPct(82, 83, true)
}

const clickNotiBalance = function () {
    clickCustom.clickPct(44, 14, true)
}

const clickNotiNoti = function () {
    ocrCustom.waitTextOCR("Agree", 0, 0, 1, true, 1, 3)
    sleep(2000)
}

const handleInputPin = function (text) {
    _ = customShell("input text " + text)
    LogRelay(name + "handleInputPin: " + text + " result: " + _)
    clickCustom.clickPct(50, 38, true)
}

const handleConfirmTransfer = function () {
    clickCustom.clickPct(70, 95, true)
}

const handleVietnamese = function () {
    clickCustom.clickPct(90, 10, true)
    clickCustom.clickPct(56, 56, true)
}

const handleKYC = function (username) {
    start = Date.now()

    LogRelay(name + "handleKYC")
    change_ramdom_video([username, "VCB"])
    LogRelay(name + "Waiting for frOverlay gone")
    elementSe.wait_resource_id_gone(rs_id_kyc, 30000)
    elementSe.wait_resource_id_gone(rs_id_loadding, 15000)
    if (id(rs_id_kyc).exists()) {
        LogRelay(name + "frOverlay not gone")
        requestCustom.pushToLaravel(this.data_pusher.idRow, "600", "KYC failed")
        managerApp.closeApp(pkg)
        force_stop = true
    } else {
        LogRelay(name + "frOverlay gone")
    }
}

const handleTransferSuccess = function () {
    LogRelay(name + "handleTransferSuccess, closing app")
    managerApp.closeApp(pkg)
}


VCBClass = function (data_pusher) {
    this.data_pusher = data_pusher
    LogRelay(this.data_pusher.customData.sOTP)
    LogRelay(this.data_pusher['customData']['sOTP'])
    sleep(1000)
    this.sOTP = this.data_pusher.customData.sOTP
    this.statusRunning = ""
}
VCBClass.prototype.handleClick = function (action) {
    switch (action) {
        case "homepage":
            clickFromHomepage()
            break;
        case "noti_balance":
            clickNotiBalance()
            break;
        case "noti_noti":
            clickNotiNoti()
            break;
        case "transfer_expired":
            requestCustom.pushToLaravel(this.data_pusher.idRow, "failed", "Transfer expired")
            this.statusRunning = "stop"
            break;
        case "input_pin":
            handleInputPin(this.sOTP)
            break;
        case "confirm_transfer":
            handleConfirmTransfer()
            this.statusRunning = "stop"
            break;
        case "kyc":
            handleKYC(this.data_pusher.username)
            break;
        case "vietnamese":
            handleVietnamese()
            break;
        case "transfer_success":
            handleTransferSuccess()
            break;
        default:
            break;
    }
}

VCBClass.prototype.handleTransfer = function () {
    LogRelay(name + "Handle transfer");
    countNotFound = 0
    requestCustom.pushToLaravel(this.data_pusher.idRow, "111", "Receive task")
    managerPhone.toggle_head_up_notification(0)
    managerPhone.change_nav_bar(1)
    managerApp.openApp(pkg, activity, true)
    sleep(1000)
    for (let i = 0; i < 10; i++) {
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
        tmp = ocrCustom.detectScreenOCR(config_detect)
        if (!tmp) {
            countNotFound++
            if (countNotFound > 3) {
                requestCustom.pushToLaravel(this.data_pusher.idRow, "777", "Can not detect screen")
                this.statusRunning = "stop"
            }
        }
        this.handleClick(tmp)
        sleep(1000)
    }

}



module.exports = VCBClass