
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
    LogRelay(html);
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

const transferLogCheck = function (id_row, now_status = false, timeout = 30000, i = 30) {
    time_start = Date.now()
    let data = false
    for (let j = 0; j < i; j++) {
        if (Date.now() - time_start > timeout) {
            break;
        }
        data = transferLogGet(id_row)
        LogRelay(name + "transferLogCheck: " + data.status)
        if (now_status) {
            if (data.status != now_status) {
                return data
            }
        }
        sleep(1000)
    }
    return data
}

const transferLogSet = function (id_row, status, checkError = false) {
    try {
        let api = Config.getConfig("API");
        let url = api + "api/adb-tool/transfer-log/update?idRow=" + id_row + "&column=status&value=" + status;
        if (checkError) {
            url += "&checkError=true";
        }
        let res = http.get(url);
        let html = res.body.string();
        res = JSON.parse(html);
        LogRelay(name + "transferLogSet: " + html)
        if (res.status) {
            return res.data
        }
        return false
    } catch (error) {
        LogRelay(name + "Error transferLogSet: " + error)
        LogRelay(error.stack)
    }

}


module.exports = {
    pushToLaravel,
    transferLogGet,
    transferLogCheck,
    transferLogSet
}