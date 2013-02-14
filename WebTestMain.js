importPackage(org.openqa.selenium.remote);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.ie);
importPackage(org.openqa.selenium.chrome);

var isExec = true;

try {

    var testfile = "test.json";
    var isQuit = false;
    var isCapture = false;
    var isMakeDoc = false;
    var isCommandList = false;
    var retryMax = 3;
    var sync_time = 0;
    var webTest;
    var seleniumrcaddr = 'http://test-cross3.nikkei-r.local:4444/wd/hub';
    var ignoreLocalBrowserKeyList = ['label', 'browserName', 'rowIndex'];

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
        }
        ,'internet explorer' : function (browser) {
            return new InternetExplorerDriver();
        }
        ,'chrome' : function (browser) {
            var
            capabilities = DesiredCapabilities.chrome()
            ,key
            ;

            for (key in browser) {
                if (ignoreLocalBrowserKeyList.indexOf(key) < 0) {
                    capabilities.setCapability(key, browser[key]);
                }
            }

            return new ChromeDriver(capabilities);
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
                if (!isNaN(arguments[1])) {
                    arguments.shift();
                    retryMax = arguments.shift();
                    continue;
                }
            }
            else if (arguments[0] == '--sync') {
                if (!isNaN(arguments[1])) {
                    arguments.shift();
                    sync_time = arguments.shift();
                    continue;
                }
            }
            else if (arguments[0] == '--doc') {
                arguments.shift();
                isMakeDoc = true;
                continue;
            }
            else if (arguments[0] == '--commandlist') {
                arguments.shift();
                isCommandList = true;
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
    if (isCommandList) {
        webTest.outputCommandList();
    }
    if (arguments.length == 0) {
        quit();
    }
    webTest.loadTest(testfile);

    if (isMakeDoc) {
        webTest.makeDoc();
        if (isQuit) {
            quit();
        }
    }
    else {

        (function () {
             var
             i
             ,key
             ,capability
             ,browser
             ;
             // ブロック防止用定期出力
             if (sync_time > 0) {
                 spawn(
                     function(x) {
                         while (isExec) {
                             java.lang.Thread.sleep(sync_time);print("#");
                         }
                     });
             }
             
             for (i = 0; i < webTest.initialize.browser.length; i++) {
                 browser = webTest.initialize.browser[i];
                 webTest.browser = browser;
                 webTest.output('browser:' + browser.label);
                 try {
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
                 } catch (x) {
                     print('ブラウザの起動に失敗しました。:' + x.message);
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
} finally {
    isExec = false;
}
