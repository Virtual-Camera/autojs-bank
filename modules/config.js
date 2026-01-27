/**
 * Config Module
 * Quản lý cấu hình và thông tin thiết bị
 */

var storageName = "ENV";
var st = storages.create(storageName);

// Default config
st.put("PUSHER_KEY", "3fa7886c712372501725");
st.put("PUSHER_CLUSTER", "ap1");
// st.put("PUSHER_CHANNEL", "SelltoolOutBank"); 
// Lưu ý: User đang dùng channel này trong ví dụ
st.put("DEVICE_SN", "28251FDH200453");
st.put("API", "https://api.ukm.vn/"); // Need "/" at the end

module.exports = {
    getPusherConfig: function () {
        return {
            key: st.get("PUSHER_KEY"),
            cluster: st.get("PUSHER_CLUSTER"),
            channel: st.get("PUSHER_CHANNEL") || "SelltoolOutBank"
        };
    },

    // Lấy Serial Number của thiết bị để so sánh
    getDeviceSN: function () {
        // Ưu tiên lấy từ storage nếu user muốn hardcode fake SN
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
