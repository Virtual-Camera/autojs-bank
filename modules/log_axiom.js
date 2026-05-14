let { get_serial_number } = require("../helpers/manager_phone.js")

log("================================================")
log("[LogAxiom]: module loaded");
log("================================================")
let url = "https://us-east-1.aws.edge.axiom.co/v1/ingest/main"

let sn = get_serial_number();

const createBody = (log, level = "info") => {
    return {
        "timestamp": Date.now(),
        "level": level,
        "sn": sn,
        "message": log
    };
}


module.exports = {
    sendLog: (log, level = "info") => {
        console.log(`[${level.toUpperCase()}]: ${log}`);
        let body = createBody(log, level);
        threads.start(() => {
            let response = http.request(url, {
                "body": JSON.stringify(body),
                "headers": {
                    "Authorization": "Bearer xaat-b1fec962-3f77-4f7d-8501-cea38619b4f3",
                    "Content-Type": "application/json"
                },
                "method": "POST"
            });
            // console.log(JSON.stringify(response));
        });
    }
}
