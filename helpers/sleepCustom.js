let name = "[Sleep]: "

module.exports = {
    sleepCustom: function (ms) {
        log(name + "Sleep: " + ms)
        let start = Date.now();
        while (Date.now() - start < ms) {
            log("Sleep: " + (Date.now() - start))
            sleep(500);
        }
    }
}