images.requestScreenCapture();
let img = images.captureScreen();
let results = ocr.detect(img);
log(results)
