/**
 * Processor Module
 * Xử lý dữ liệu nghiệp vụ sau khi đã khớp SN
 */
var VTB = require("../handle/vtb.js");
var VCBClass = require("../handle/vcb.js");
module.exports = {
    handle: function (payload) {
        // log(">>> BẮT ĐẦU XỬ LÝ NGHIỆP VỤ <<<");
        log("Start handle message from pusher")
        // log("Dữ liệu nhận được: " + JSON.stringify(payload));
        // Ví dụ: Parse data
        var data = payload.data;
        if (!data) return;

        log("Data: " + JSON.stringify(data));
        let fullBank = data.fullBank
        switch (fullBank) {
            case "vtb-personal-sync":
                VTB.handleTransfer(data);
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
    }
};
