
let name = "[RequestCustom]: "


const pushToLaravel = function (id_row, status, message) {
    let api = Config.getConfig("API");
    let url = api + "api/selltool/push-message-transfer";
    let data = {
        idRow: id_row,
        status: status,
        message: message
    };
    let res = http.post(url, data);
    let html = res.body.string();
    log(html);
    return html;
}

const transferLogGet = function (id_row) {
    let api = Config.getConfig("API");
    let url = api + "api/adb-tool/transfer-log/get?idRow=" + id_row;
    let res = http.get(url);
    let html = res.body.string();
    res = JSON.parse(html);
    if (res.status) {
        return res.data
    }
    return false
}

const checkStatusTransferLog = function (id_row, now_status = false, timeout = 30000, i = 30) {
    time_start = Date.now()
    let data = false
    for (let j = 0; j < i; j++) {
        if (Date.now() - time_start > timeout) {
            break;
        }
        data = transferLogGet(id_row)
        log(name + "checkStatusTransferLog: " + data.status)
        if (now_status) {
            if (data.status != now_status) {
                return data
            }
        }
        sleep(1000)
    }
    return data
}

const setStatusTransferLog = function (id_row, status) {
    try {
        let api = Config.getConfig("API");
        let url = api + "api/adb-tool/transfer-log/update?idRow=" + id_row + "&column=status&value=" + status;
        let res = http.get(url);
        let html = res.body.string();
        res = JSON.parse(html);
        log(name + "setStatusTransferLog: " + html)
        if (res.status) {
            return res.data
        }
        return false
    } catch (error) {
        log(name + "Error setStatusTransferLog: " + error)
        log(error.stack)
    }

}


module.exports = {
    pushToLaravel,
    transferLogGet,
    checkStatusTransferLog,
    setStatusTransferLog
}