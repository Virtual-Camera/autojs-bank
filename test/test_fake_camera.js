// let { customShell } = require("../helpers/custom_shell.js")
let ShizukuShell = function (command) {
    log(name + "ShizukuShell: " + command)
    let _ = shizuku(command)
    log(name + "ShizukuShell result: " + JSON.stringify(_))
    if (!_.result) {
        log(name + "ShizukuShell: run command failed, maybe Shizuku not running")
        return false
    }
    return _
}

let customShell = function (command) {
    log(name + "customShell: " + command)
    let _
    _ = shell(command, true)

    if (_ && _.error) {
        if (String(_.error).includes('Cannot run program "su"')) {
            log("Cannot run program 'su'")
            _ = ShizukuShell(command)
            return _
        } else {
            log(_.error)
            return _
        }
    }
    return _
}
// shell("am start-foreground-service -n com.camera3/.ForegroundService", true)
// let pathVideo = "/sdcard/Movies/FaceData/FACE_CUSTOM_VTB_0709_2026-01-12-23-25-34.mp4.mp4"
// _ = shell("am broadcast -a com.camera3.action.SET_VIDEO --es video_path " + pathVideo + " -n com.camera3/.CommandReceiver", true)
// log(_)
let _
name = "[FakeCamera]: "
const change_video_camera = function (action, data) {
    _ = customShell("am start-foreground-service -n com.camera3/.ForegroundService")
    log(_)
    switch (action) {
        case "change":
            log(name + "Change video camera, path:" + data)
            _ = customShell("am broadcast -a com.camera3.action.SET_VIDEO --es video_path " + data + " -n com.camera3/.CommandReceiver")
            log(_)
            break;
        case "clear":
            log(name + "Clear video camera")
            _ = customShell("am broadcast -a com.camera3.action.CLEAR_VIDEO -n com.camera3/.CommandReceiver")
            log(_)
            break;
        default:
            log(name + "Invalid action")
            break;
    }
}


const select_random_video = function (includeName = [], folder_video = "/sdcard/Movies/FaceData/") {
    let listVideo = files.listDir(folder_video)
    let filtedVideo = []
    listVideo.forEach(video => {
        includeStatus = true
        includeName.forEach(name => {
            if (!(video.toLowerCase()).includes(name.toLowerCase())) {
                includeStatus = false
            }
        })
        if (includeStatus) {
            filtedVideo.push(video)
        }

    })
    let randomVideo = filtedVideo[Math.floor(Math.random() * filtedVideo.length)]
    return folder_video + randomVideo
}

const change_ramdom_video = function (includeName = [], folder_video = "/sdcard/Movies/FaceData/") {
    pathVideo = select_random_video(includeName, folder_video)
    _ = change_video_camera("change", pathVideo)
}

change_ramdom_video(["0387654818", "VCB"])