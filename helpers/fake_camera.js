let { customShell } = require("../helpers/custom_shell.js")
let _
let name = "[FakeCamera]: "
const change_video_camera = function (action, data) {
    _ = customShell("am start-foreground-service -n com.camera3/.ForegroundService")
    switch (action) {
        case "change":
            log(name + "Change video camera, path:" + data)
            _ = customShell("am broadcast -a com.camera3.action.SET_VIDEO --es video_path " + data + " -n com.camera3/.CommandReceiver")
            break;
        case "clear":
            log(name + "Clear video camera")
            _ = customShell("am broadcast -a com.camera3.action.CLEAR_VIDEO -n com.camera3/.CommandReceiver")
            break;
        default:
            log(name + "Invalid action")
            break;
    }
}


const select_random_video = function (includeText = [], folder_video = "/sdcard/Movies/FaceData/") {
    try {
        let listVideo = files.listDir(folder_video)
        log(name + "select_random_video from folder: " + folder_video + ", list: " + String(listVideo))
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
        log(name + "select_random_video: " + e)
        return false
    }

}

const change_ramdom_video = function (includeName = [], folder_video = "/sdcard/Movies/FaceData/") {
    pathVideo = select_random_video(includeName, folder_video)
    if (pathVideo) {
        _ = change_video_camera("change", pathVideo)
    } else {
        log(name + "Can not select random video")
    }
}

module.exports = {
    change_video_camera,
    select_random_video,
    change_ramdom_video
}
