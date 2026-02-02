/**
 * Processor Module
 * Xử lý dữ liệu nghiệp vụ sau khi đã khớp SN
 */
let {LogRelay} = require("../modules/log_relay.js");

var VTBClass = require("../handle/vtb.js");
var VCBClass = require("../handle/vcb.js");
var BIDVClass = require("../handle/bidv.js");
module.exports = {
    handle: function (payload) {
        try {
            LogRelay("Start handle message from pusher")
            var data = payload.data;
            if (!data) return;

            LogRelay("Data: " + JSON.stringify(data));
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
                default:
                    LogRelay("Unknown bank: " + fullBank);
                    break;
            }
            // TODO: Viết logic auto banking ở đây
            // Ví dụ: mở app ngân hàng, điền số tài khoản, v.v.


            // Giả lập xử lý xong
            sleep(2000);
            LogRelay("End handle message from pusher")
        } catch (error) {
            LogRelay("Error handle message from pusher: " + error)
            LogRelay(error.stack)
        }
    }
};
