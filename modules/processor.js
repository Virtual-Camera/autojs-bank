/**
 * Processor Module
 * Xử lý dữ liệu nghiệp vụ sau khi đã khớp SN
 */
var VTBClass = require("../handle/vtb.js");
var VCBClass = require("../handle/vcb.js");
module.exports = {
    handle: function (payload) {
        try {
            log("Start handle message from pusher")
            var data = payload.data;
            if (!data) return;

            log("Data: " + JSON.stringify(data));
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
                default:
                    log("Unknown bank: " + fullBank);
                    break;
            }
            // TODO: Viết logic auto banking ở đây
            // Ví dụ: mở app ngân hàng, điền số tài khoản, v.v.


            // Giả lập xử lý xong
            sleep(2000);
            log("End handle message from pusher")
        } catch (error) {
            log("Error handle message from pusher: " + error)
            log(error.stack)
        }
    }
};
