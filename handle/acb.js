let { sendLog } = require("../modules/log_axiom.js");
let managerApp = require("../helpers/manager_app.js");
let requestCustom = require("../helpers/request_custom.js");
let ocrCustom = require("../helpers/ocr_custom.js");
let { sleepCustom, showText } = require("../helpers/utils.js");
let clickCustom = require("../helpers/click_custom.js");
let { fake_qr_code, change_ramdom_video } = require("../helpers/fake_camera.js")

let name = "[ACB]: "
let pkg = "mobile.acb.com.vn"

let config_detect = {
    "vietnamese": {
        "text": [
            "Dang nhap"
        ]
    },
    "homepage": {
        "text": [
            "Log", "in", "Get", "OTP", "QR"
        ]
    },
    "error_1": {
        "text": [
            "Error", "transaction", "limit"
        ]
    },
    "notice_login": {
        "text": [
            "Login", "Log", "in", "Later"
        ]
    },
    "tab_login": {
        "text": [
            "Hello", "Password", "Forgot"
        ]
    },
    "after_scan_qr": {
        "text": [
            "transferring", "continue"
        ],
        "not_text": [
            ["Insufficient"]
        ]
    },
    "tab_confirm": {
        "text": [
            "Confirm", "From", "To"
        ]
    },
    "input_safe_key": {
        "text": [
            "Enter", "Safe", "key"
        ],
        "not_text": [
            ["Confirm",]
        ]
    },
    "confirm_otp": {
        "text": [
            "Confirm", "OTP", "Enter"
        ]
    },
    "success_transfer": {
        "text": [
            "Successful"
        ]
    },
    "kyc": {
        "text": [
            "Photo", "face"
        ]
    },
    "balance_not_enough": {
        "text": [
            "Insufficient"
        ]
    }
}


ACBClass = function (data_pusher) {
    try {
        this.data_pusher = data_pusher
        this.statusRunning = ""
        this.id_row = data_pusher['idRow']
        this.force_stop = false
        this.count_fake_camera = 0
        this.count_kyc_screen = 0
        this.count_kyc_failed = 0
        this.count_tab_login = 0
    } catch (error) {
        sendLog(name + "Error constructor: " + error)
        sendLog(error.stack)
    }
}

ACBClass.prototype.handleTransfer = function () {
    try {
        let check_continue = {
            new_key: "",
            old_key: "",
            count: 0,
            max_count: 3
        }
        sendLog(name + "handleTransfer")
        this.qrCode = this.data_pusher['customData']['transLog']['saveData3']
        console.hide();
        requestCustom.transferLogSet(this.id_row, "111", true)
        let _ = managerApp.openApp(pkg, "", true, true)
        sendLog(name + "openApp: " + _)
        fake_qr_code(this.qrCode, 200)
        sleepCustom(2000)
        for (let i = 0; i < 20; i++) {
            if (this.statusRunning == "stop") {
                sendLog(name + "statusRunning == stop")
                break;
            }
            if (this.force_stop) {
                sendLog(name + "force_stop == true")
                this.force_stop = false
                break;
            }
            sendLog(name + "===============Detect i: " + i + "===============")
            sleepCustom(1000)
            detect = ocrCustom.detectScreenOCR(config_detect, 1, 5)
            check_continue.new_key = detect
            if (!ocrCustom.continueDetect(check_continue)) {
                sendLog(name + "continueDetect == false")
                break;
            }
            this.handleClick(detect)
        }
        managerApp.closeApp(pkg)
    } catch (error) {
        sendLog(name + "Error handleTransfer: " + error)
        sendLog(error.stack)
    }
}

ACBClass.prototype.handleClick = function (detect) {
    try {
        sendLog(name + "handleClick: " + detect)
        switch (detect) {
            case "vietnamese":
                sendLog(name + "Action vietnamese")
                toast("Change app language to English")
                this.statusRunning = "stop"
                break;
            case "homepage":
                sendLog(name + "Action homepage")
                clickCustom.clickPct(80, 87, true)
                break;
            case "notice_login":
                sendLog(name + "Action notice login")
                clickCustom.clickPct(70, 60, true)
                change_ramdom_video([this.data_pusher.username, "ACB"])

                break;
            case "tab_login":
                this.count_tab_login += 1
                if (this.count_tab_login > 2) {
                    sendLog(name + "Action tab login")
                    showText("Enable login with fingerprint", 150, 1180, 60, "#0000FF", 2000)
                }
                break;
            case "after_scan_qr":
                sendLog(name + "Action after scan qr")
                clickCustom.clickPct(50, 90, true)
                break;
            case "tab_confirm":
                sendLog(name + "Action tab confirm")
                clickCustom.clickPct(50, 90, true)
                break;
            case "input_safe_key":
                sendLog(name + "Action input safe key")
                _ = requestCustom.transferLogGet(this.id_row)
                sendLog(name + "transferLogGet: " + JSON.stringify(_))
                if (_['status'] != "111") {
                    sendLog(name + "status != 111")
                    toast("Status not 111")
                    this.statusRunning = "stop"
                    return false
                }
                let safe_key = this.data_pusher.customData.sOTP
                clickCustom.clickInputText(safe_key)
                break;
            case "confirm_otp":
                sendLog(name + "Action confirm otp")
                clickCustom.clickPct(50, 90, true)
                sleepCustom(5000)
                break;
            case "success_transfer":
                sendLog(name + "Action success transfer")
                requestCustom.transferLogSet(this.id_row, "00")
                this.statusRunning = "stop"
                break;
            case "kyc":
                sendLog(name + "Action kyc")
                clickCustom.clickPct(50, 80, true)
                sleepCustom(2000)
                break;
            case "balance_not_enough":
                sendLog(name + "Action balance not enough")
                showText("Balance not enough", 150, 1180, 60, "#0000FF", 2000)
                requestCustom.transferLogSet(this.id_row, "810")
                this.statusRunning = "stop"
                break;
            case "error_1":
                sendLog(name + "Action error 1")
                showText("Error 1", 150, 1180, 60, "#0000FF", 2000)
                requestCustom.transferLogSet(this.id_row, "810")
                this.statusRunning = "stop"
                break;

        }
    } catch (error) {
        sendLog(name + "Error handleClick: " + error)
        sendLog(error.stack)
    }
}

module.exports = ACBClass