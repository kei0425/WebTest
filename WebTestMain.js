importPackage(org.openqa.selenium.remote);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.ie);

try {

    var testfile = "test.json";
    var isQuit = false;
    var isCapture = false;
    var isMakeDoc = false;
    var retryMax = 3;
    var webTest;
    var seleniumrcaddr = 'http://test-cross3.nikkei-r.local:4444/wd/hub';

    var localBrowserSelecter = {
        firefox : function (browser) {
            if (browser.firefox_binary) {
                return new FirefoxDriver(
                    new FirefoxBinary(new java.io.File(browser.firefox_binary))
                    ,new FirefoxProfile());
            }
            else {
                return new FirefoxDriver();
            }
        },
        'internet explorer' : function (browser) {
            return new InternetExplorerDriver();
        }
    };

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
            else if (arguments[0] == '--retry') {
                if (!isNan(arguments[1])) {
                    arguments.shift();
                    retryMax = arguments.shift();
                    continue;
                }
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
        print("引数が不正です。");
        quit();
    }

    load("WebTest.js");
    webTest = new WebTest({capture : isCapture, retryMax : retryMax});
    webTest.loadTest(testfile);

    if (isMakeDoc) {
        webTest.makeDoc();
        if (isQuit) {
            quit();
        }
    }
    else {
        (function () {
             var i
             ,key
             ,capability
             ,browser
             ;
             
             for (i = 0; i < webTest.initialize.browser.length; i++) {
                 browser = webTest.initialize.browser[i];
                 webTest.output('browser:' + browser.label);
                 if (browser.remote) {
                     // リモートの場合
                     capability = new DesiredCapabilities();
                     for (key in webTest.initialize.browser[i]) {
                         if (key != 'label' && key != 'remote') {
                             capability[key] = browser[key];
                         }
                     }
                     webTest.driver = new RemoteWebDriver(
                         new java.net.URL(seleniumrcaddr),
                         capability);
                 }
                 else {
                     // ローカルの場合
                     webTest.driver =
                         localBrowserSelecter[browser.browserName](browser);
                 }
                 webTest.baseDir = webTest.initialize.baseDir
                     + browser.label
                     + java.io.File.separator;
                 new java.io.File(webTest.baseDir).mkdirs();
                 webTest.runner();
                 webTest.driver.quit();
             }
         })();
    }
} catch (x) {
    print (x.name);
    print (x.message);
    print (x.fileName);
    print (x.lineNumber);
}
