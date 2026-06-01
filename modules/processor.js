/**
 * Processor Module
 * Xử lý dữ liệu nghiệp vụ sau khi đã khớp SN
 */
let processor_log = globalThis.__LogAxiomSingleton__;
let sendLog = processor_log?.sendLog || null;

var VTBClass = require("../handle/vtb.js");
var VCBClass = require("../handle/vcb.js");
var BIDVClass = require("../handle/bidv.js");
var ACBClass = require("../handle/acb.js");
module.exports = {
    handle: function (payload) {
        try {
            sendLog("Start handle message from pusher")
            var data = payload.data;
            if (!data) return;

            sendLog("Data: " + JSON.stringify(data));
            let fullBank = data.fullBank
            switch (fullBank) {
                case "vtb-personal-sync":
                    let vtb = new VTBClass(data)
                    vtb.handleTransfer();
                    break;
                case "vcb-personal-sn-in-api":
                    let vcb = new VCBClass(data)
                    vcb.handleTransfer();
                    break;
                case "bidv-personal":
                    let bidv = new BIDVClass(data)
                    bidv.handleTransfer();
                    break;
                case "acb-personal":
                    let acb = new ACBClass(data)
                    acb.handleTransfer();
                    break;
                default:
                    sendLog("Unknown bank: " + fullBank);
                    break;
            }
            // TODO: Viết logic auto banking ở đây
            // Ví dụ: mở app ngân hàng, điền số tài khoản, v.v.


            // Giả lập xử lý xong
            sleep(2000);
            sendLog("End handle message from pusher")
        } catch (error) {
            sendLog("Error handle message from pusher: " + error)
            sendLog(error.stack)
        }
    }
};
