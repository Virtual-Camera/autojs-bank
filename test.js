let clickBoundsCustom = function (e, xOffset, yOffset) {
    try {
        let bounds = e.bounds;
        let x = bounds.centerX() + xOffset;
        let y = bounds.centerY() + yOffset;
        log("x: " + x + " y: " + y)
        sleep(1000)
        click(x, y);
    } catch (e) {
        log(e)
        return false
    }
}


_ = shizuku("am force-stop com.VCB")
log(_)
_ = shizuku("am start -n com.VCB/.ui.activities.splash.SplashActivity")
log(_)



