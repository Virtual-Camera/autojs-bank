const wait_resource_id_gone = function (resource_id, timeout = 10000) {
    start = Date.now()
    while (Date.now() - start < timeout) {
        log("Waiting for resource id gone: " + resource_id + " timeout: " + timeout)
        sleep(1000)
        if (!id(resource_id).exists()) {
            return true
        }
    }
    return false
}


module.exports = {
    wait_resource_id_gone
}