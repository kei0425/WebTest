var testfile = "test.json";
var isQuit = false;
var isCapture = false;
if (arguments.length > 0) {
    while (true) {
        if (arguments[0] == '--quit') {
            arguments.shift();
            isQuit = true;
            continue;
        }
        else if (arguments[0] == '--capture') {
            arguments.shift();
            isCapture = true;
            continue;
        }
        break;
    }
}
if (arguments.length == 1) {
    testfile = arguments[0];
}
else if (arguments.length > 1) {
    print("ˆø”‚ÌŒÂ”‚ª•s³‚Å‚·B");
    quit();
}

load("WebTest.js");
var webTest = new WebTest({capture : isCapture});
webTest.loadTest(testfile);
webTest.runner();
if (isQuit) {
    webTest.driver.quit();
    quit();    
}
