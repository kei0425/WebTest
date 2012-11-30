importPackage(org.openqa.selenium.remote);

var testfile = "test.json";
var isQuit = false;
var isCapture = false;
var isMakeDoc = false;
var webTest;
var seleniumrcaddr = 'http://test-cross3.nikkei-r.local:4444/wd/hub';

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
        else if (arguments[0] == '--doc') {
            arguments.shift();
            isMakeDoc = true;
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
webTest = new WebTest({capture : isCapture});
webTest.loadTest(testfile);

if (isMakeDoc) {
    webTest.makeDoc();
    if (isQuit) {
        quit();
    }
}
else {
    if (webTest.initialize.browser == null
        || webTest.initialize.browser.length == null) {
        webTest.driver = new FirefoxDriver();
        webTest.runner();

        if (isQuit) {
            webTest.driver.quit();
            quit();    
        }
    }
    else {
        (function () {
             var i
             ,key
             ,capability
             ;
             
             for (i = 0; i < webTest.initialize.browser.length; i++) {
                 capability = new DesiredCapabilities();
                 for (key in webTest.initialize.browser[i]) {
                     capability[key] = webTest.initialize.browser[i][key];
                 }
                 webTest.driver = new RemoteWebDriver(
                     new java.net.URL(seleniumrcaddr),
                     capability);
                 webTest.runner();
                 webTest.driver.quit();
             }
         })();
    }
}
