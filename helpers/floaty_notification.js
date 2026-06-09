/**
 * Module hiển thị thông báo floaty tự động đóng
 * @param {string} message - Nội dung thông báo
 * @param {number} durationSeconds - Thời gian hiển thị (giây), mặc định 5 giây
 * @param {object} options - Tùy chọn hiển thị
 * @returns {object} floaty window object
 */
function showNotification(message, durationSeconds = 5, options = {}) {
    const defaults = {
        backgroundColor: "#FF5252",  // Màu đỏ cảnh báo
        textColor: "#FFFFFF",
        fontSize: 18,
        padding: 20,
        borderRadius: 12,
        width: -1,  // wrap_content
        gravity: "center"  // center, top, bottom
    };

    const config = Object.assign({}, defaults, options);

    // Tạo layout XML
    const layout = (
        <frame>
            <card
                w="*"
                h="auto"
                cardBackgroundColor={config.backgroundColor}
                cardCornerRadius={config.borderRadius}
                cardElevation="8dp"
                margin="16">
                <vertical padding={config.padding}>
                    <text
                        text={message}
                        textSize={config.fontSize}
                        textColor={config.textColor}
                        gravity="center"
                        w="*" />
                </vertical>
            </card>
        </frame>
    );

    // Tạo floaty window
    const window = floaty.window(layout);

    // Đặt vị trị hiển thị
    if (config.gravity === "top") {
        window.setPosition(0, 100);
    } else if (config.gravity === "bottom") {
        window.setPosition(0, device.height - 300);
    } else {
        // center
        window.setPosition(0, device.height / 2 - 100);
    }

    // Tự động đóng sau x giây
    setTimeout(() => {
        try {
            window.close();
        } catch (e) {
            console.error("[FloatyNotification] Error closing window:", e);
        }
    }, durationSeconds * 1000);

    return window;
}

/**
 * Hiển thị thông báo cảnh báo (màu đỏ)
 */
function showWarning(message, durationSeconds = 5) {
    return showNotification(message, durationSeconds, {
        backgroundColor: "#FF5252"
    });
}

/**
 * Hiển thị thông báo thông tin (màu xanh dương)
 */
function showInfo(message, durationSeconds = 5) {
    return showNotification(message, durationSeconds, {
        backgroundColor: "#2196F3"
    });
}

/**
 * Hiển thị thông báo thành công (màu xanh lá)
 */
function showSuccess(message, durationSeconds = 5) {
    return showNotification(message, durationSeconds, {
        backgroundColor: "#4CAF50"
    });
}

module.exports = {
    showNotification,
    showWarning,
    showInfo,
    showSuccess
};
