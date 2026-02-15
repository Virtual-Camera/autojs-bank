let { customShell } = require("../helpers/custom_shell.js")
let { sleepCustom, showText } = require("../helpers/utils.js");
let { LogRelay } = require("../modules/log_relay.js");
let _
let name = "[FakeCamera]: "
const change_video_camera = function (action, data) {
    _ = customShell("am start-foreground-service -n com.camera3/.ForegroundService")
    switch (action) {
        case "change":
            LogRelay(name + "Change video camera, path:" + data)
            _ = customShell("am broadcast -a com.camera3.action.SET_VIDEO --es video_path " + data + " -n com.camera3/.CommandReceiver")
            break;
        case "clear":
            LogRelay(name + "Clear video camera")
            _ = customShell("am broadcast -a com.camera3.action.CLEAR_VIDEO -n com.camera3/.CommandReceiver")
            break;
        default:
            LogRelay(name + "Invalid action")
            break;
    }
}


const select_random_video = function (includeText = [], folder_video = "/sdcard/Movies/FaceData/") {
    try {
        let listVideo = files.listDir(folder_video)
        LogRelay(name + "select_random_video from folder: " + folder_video + ", list: " + JSON.stringify(listVideo) + ", includeText: " + JSON.stringify(includeText))
        let filtedVideo = []
        listVideo.forEach(video => {
            includeStatus = true
            includeText.forEach(text => {
                if (text) {
                    if (!(video.toLowerCase()).includes(text.toLowerCase())) {
                        includeStatus = false
                    }
                }
            })
            if (includeStatus) {
                filtedVideo.push(video)
            }

        })
        let randomVideo = filtedVideo[Math.floor(Math.random() * filtedVideo.length)]
        return folder_video + randomVideo
    } catch (e) {
        LogRelay(name + "select_random_video: " + e)
        return false
    }

}

const change_ramdom_video = function (includeName = [], folder_video = "/sdcard/Movies/FaceData/") {
    pathVideo = select_random_video(includeName, folder_video)
    if (pathVideo) {
        if (pathVideo.includes("undefined")) {
            LogRelay(name + "pathVideo is undefined", "warn")
            showText("Can not select random video", 150, 1180, 50, "#0000FF", 1000)
            return false
        }
    } else {
        LogRelay(name + "Can not select random video", "warn")
        return false
    }
    LogRelay(name + "pathVideo: " + pathVideo)
    LogRelay(name + "change_ramdom_video: " + pathVideo)
    _ = change_video_camera("change", pathVideo)
}

const fake_qr_code = function (text = "", margin = 10) {
    _ = shell("cd /sdcard/Download/ && qrgen --text '" + text + "' -v --format mp4 -o qr.mp4 --margin " + margin)
    LogRelay(name + "fake_qr_code: " + _)
    change_video_camera("change", "/sdcard/Download/qr.mp4")
}

module.exports = {
    change_video_camera,
    select_random_video,
    change_ramdom_video,
    fake_qr_code
}
