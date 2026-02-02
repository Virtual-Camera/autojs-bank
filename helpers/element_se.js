let { LogRelay } = require("../modules/log_relay.js");
let name = "[Element-SE]: "
const wait_resource_id_gone = function (resource_id, timeout = 10000) {
    start = Date.now()
    while (Date.now() - start < timeout) {
        LogRelay(name + "Waiting for resource id gone: " + resource_id + " timeout: " + (Date.now() - start))
        sleep(500)
        if (!id(resource_id).exists()) {
            return true
        }
    }
    return false
}

function wait_any_id(id1, id2, timeout = 10000) {
    let start = Date.now();
    while (Date.now() - start < timeout) {
        if (id(id1).exists()) return id1;
        if (id(id2).exists()) return id2;
        sleep(500);
    }
    return null;
}
function wait_gone_id(resource_id, timeout = 10000) {
    start = Date.now()
    while (Date.now() - start < timeout) {
        LogRelay(name + "Waiting for resource id gone: " + resource_id + " timeout: " + (Date.now() - start))
        sleep(500)
        if (!id(resource_id).exists()) {
            return true
        }
    }
    return false
}


module.exports = {
    wait_resource_id_gone,
    wait_any_id,
    wait_gone_id
}