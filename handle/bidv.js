
let ocrCustom = require("../helpers/ocr_custom.js")
let managerApp = require("../helpers/manager_app.js")
let { clickPct } = require("../helpers/click_custom.js")
let { sleepCustom } = require("../helpers/utils.js")
let { fake_qr_code } = require("../helpers/fake_camera.js")
let { change_ramdom_video } = require("../helpers/fake_camera.js")
let requestCustom = require("../helpers/request_custom.js")
let elementSe = require("../helpers/element_se.js")
let {LogRelay} = require("../modules/log_relay.js")
let name = "[BIDV]: "
let pkg = "com.vnpay.bidv"
let wait, _, res

let config_detect = {
    "vietnamese": {
        "text": [
            "Quet", "Dang nhap"
        ]
    },
    "homepage": {
        "text": [
            "Log", "in", "Scan", "QR"
        ]
    },
    "tab_scan": {
        "text": [
            "Scan", "QR"
        ],
        "not_text": [
            [
                "Log", "in"
            ], [
                "Close"
            ], [
                "Check", "again"
            ]
        ]
    },
    "scan_error": {
        "text": [
            "Notification", "QR"
        ]
    },
    "transfer_confirm": {
        "text": [
            "Confirm", "transaction"
        ]
    },
    "kyc": {
        "text": [
            "Face"
        ],
        "not_text": [
            ["System"],
            ["interrupted"]
        ]
    },
    "error_interrupted": {
        "text": [
            "interrupted", "try", "again"
        ]
    }
}

BIDVClass = function (data_pusher) {
    try {
        this.data_pusher = data_pusher
        this.statusRunning = ""
        this.id_row = data_pusher['idRow']
        this.force_stop = false
        this.count_fake_camera = 0
    } catch (error) {
        LogRelay(name + "Error constructor: " + error)
        LogRelay(error.stack)
    }
}

BIDVClass.prototype.handleTransfer = function () {
    try {
        LogRelay(name + "handleTransfer")
        console.hide();
        requestCustom.transferLogSet(this.id_row, "111")
        let _ = managerApp.openApp(pkg, "", true, true)
        let data = requestCustom.transferLogCheck(this.id_row, "111", 30000, 30)
        if (!data) {
            LogRelay(name + "data not found 5686ew")
            return
        }
        if (data.status != "500") {
            LogRelay(name + "data status != 500")
            return
        }
        _ = requestCustom.transferLogGet(this.id_row)
        LogRelay(name + "transferLogGet: " + JSON.stringify(_))
        let qrCode = _['saveData']
        LogRelay(name + "qrCode: " + qrCode)
        fake_qr_code(qrCode, 200)
        // change_ramdom_video([this.data_pusher.username, "VTB"])
        // count_fake_camera += 1
        sleepCustom(2000)
        for (let i = 0; i < 10; i++) {

            if (this.statusRunning == "stop") {
                LogRelay(name + "statusRunning == stop")
                managerApp.closeApp(pkg)
                break;
            }
            if (this.force_stop) {
                LogRelay(name + "force_stop == true")
                managerApp.closeApp(pkg)
                this.force_stop = false
                break;
            }
            LogRelay(name + "Detect i: " + i)
            sleepCustom(1000)
            detect = ocrCustom.detectScreenOCR(config_detect, 1, 5)
            this.handleClick(detect)

        }
        this.statusRunning = "stop"
    } catch (error) {
        LogRelay(name + "Error handleTransfer: " + error)
        LogRelay(error.stack)
        this.statusRunning = "stop"
    }
}

BIDVClass.prototype.handleClick = function (action) {
    try {
        LogRelay(name + "handle click: " + action)
        switch (action) {
            case "vietnamese":
                LogRelay(name + " Change app language to English")
                this.statusRunning = "stop"
                break;
            case "homepage":
                LogRelay(name + " Action homepage")
                clickPct(50, 90, true)
                break;
            case "tab_scan":
                LogRelay(name + " Action tab scan")
                // elementSe.wait_gone_id("com.vnpay.bidv:id/llQrSelectPhoto", 10000)
                sleepCustom(3000)
                break;
            case "transfer_confirm":
                LogRelay(name + " Action transfer confirm")
                clickPct(50, 90, true)
                change_ramdom_video([this.data_pusher.username, "BIDV"])
                sleepCustom(2000)
                break;
            case "scan_error":
                LogRelay(name + " Action scan error")
                // clickPct(50, 90, true)
                sleepCustom(2000)
                break;
            case "success_transfer":
                LogRelay(name + " Action success transfer")
                this.statusRunning = "stop"
                break;
            case "kyc":
                LogRelay(name + " Action kyc")
                // elementSe.wait_gone_id("com.vietinbank.ipay:id/fFacePayCamera", 20000)
                break;

        }
    } catch (error) {
        LogRelay(name + "Error handleClick: " + error)
        LogRelay(error.stack)
    }
}



module.exports = BIDVClass