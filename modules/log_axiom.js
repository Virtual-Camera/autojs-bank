let { get_serial_number } = require("../helpers/manager_phone.js")

log("================================================")
log("[LogAxiom]: module loaded")
log("================================================")

const url = "https://us-east-1.aws.edge.axiom.co/v1/ingest/main"
const KEY = "__LogAxiomSingleton__"

if (!globalThis[KEY]) {
    const sn = get_serial_number()   // lấy serial number 1 lần duy nhất

    const createBody = (message, level = "info") => ({
        timestamp: Date.now(),
        level: level,
        sn: sn,                    // dùng biến sn đã khai báo
        message: message
    })

    function sendLog(message, level = "info") {
        console.log(`[${level.toUpperCase()}]: ${message}`)

        const body = createBody(message, level)

        threads.start(() => {
            try {
                const response = http.request(url, {
                    body: JSON.stringify(body),
                    headers: {
                        "Authorization": "Bearer xaat-b1fec962-3f77-4f7d-8501-cea38619b4f3",
                        "Content-Type": "application/json"
                    },
                    method: "POST"
                })
                // Nếu muốn debug response thì bỏ comment dòng dưới
                // console.log("Axiom response: " + JSON.stringify(response))
            } catch (e) {
                console.error("[LogAxiom] Send log failed:", e)
            }
        })
    }

    // Gán đầy đủ vào globalThis
    globalThis[KEY] = {
        sendLog,
        sn
    }

    log("[LogAxiom]: Singleton initialized successfully")
}