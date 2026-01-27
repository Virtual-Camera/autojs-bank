/**
 * Config Module
 * Manage configuration and device information
 */

let { get_serial_number } = require("../helpers/manager_phone.js")
var storageName = "ENV";
var st = storages.create(storageName);

// Default config
st.put("PUSHER_KEY", "3fa7886c712372501725");
st.put("PUSHER_CLUSTER", "ap1");
// st.put("PUSHER_CHANNEL", "SelltoolOutBank"); 
st.put("DEVICE_SN", "");
st.put("API", "https://api.ukm.vn/"); // Need "/" at the end

module.exports = {
    getPusherConfig: function () {
        return {
            key: st.get("PUSHER_KEY"),
            cluster: st.get("PUSHER_CLUSTER"),
            channel: st.get("PUSHER_CHANNEL") || "SelltoolOutBank"
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
        log("Device SN from storage: " + savedSN);
        if (savedSN) return savedSN;

        // Thử lấy Android ID (thường ổn định hơn Serial trên Android mới)
        try {
            var androidId = device.getAndroidId();
            log("Android ID: " + androidId);
            return androidId;
        } catch (e) {
            log("Error getting Android ID: " + e);
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
