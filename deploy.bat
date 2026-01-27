@echo off
echo [INFO] Creating directory on device...
adb shell mkdir -p /sdcard/Scripts/AutoBank/modules

adb push main.js /sdcard/Scripts/AutoBank/

adb push env.js /sdcard/Scripts/AutoBank/

adb push modules /sdcard/Scripts/AutoBank/

adb push handle /sdcard/Scripts/AutoBank/

adb push helpers /sdcard/Scripts/AutoBank/

adb push images /sdcard/Scripts/AutoBank/
echo [INFO] Launching AutoJS Script...
adb shell am start -W -n org.autojs.autojs6/org.autojs.autojs.external.open.RunIntentActivity -d "file:///sdcard/Scripts/AutoBank/main.js"

echo [INFO] Done.
