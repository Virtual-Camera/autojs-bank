
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

module.exports = {
    pushToLaravel
}