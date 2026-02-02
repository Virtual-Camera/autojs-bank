/**
 * Config Module
 * Manage configuration and device information
 */
// const ENV = require("../env.js");
let {LogRelaySE} = require("../modules/log_relay.js");
let { get_serial_number } = require("../helpers/manager_phone.js")
var storageName = "ENV";
var st = storages.create(storageName);

// Default config
st.put("PUSHER_KEY", ENV.PUSHER_KEY);
st.put("PUSHER_CLUSTER", ENV.PUSHER_CLUSTER);
st.put("DEVICE_SN", "");
// Check / in end line
let _ = ENV.API
if (_[_.length - 1] !== "/") {
    _ += "/"
}
st.put("API", _); // Need "/" at the end

module.exports = {
    getPusherConfig: function () {
        return {
            key: ENV.PUSHER_KEY,
            cluster: ENV.PUSHER_CLUSTER,
            // channel: st.get("PUSHER_CHANNEL") || "SelltoolOutBank"
            channel: "SelltoolOutBank"
        };
    },

    // Get device serial number for comparison
    getDeviceSN: function () {
        // Priority: get from storage if user wants to hardcode fake SN
        let sn = get_serial_number()
        if (sn) {
            return sn
        }
        var savedSN = st.get("DEVICE_SN");
        LogRelaySE("Device SN from storage: " + savedSN);
        if (savedSN) return savedSN;

        // Thử lấy Android ID (thường ổn định hơn Serial trên Android mới)
        try {
            var androidId = device.getAndroidId();
            LogRelaySE("Android ID: " + androidId);
            return androidId;
        } catch (e) {
            LogRelaySE("Error getting Android ID: " + e);
            return device.serial; // Fallback
        }
    },

    // Hàm tiện ích để cập nhật cấu hình nếu cần
    setConfig: function (key, value) {
        st.put(key, value);
    },

    getConfig: function (key) {
        return st.get(key);
    }
};
