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
    webTest.loadTest(testfile);

    if (isCommandList) {
        webTest.outputCommandList();
        quit();
    }

    if (isMakeDoc) {
        webTest.makeDoc();
        if (isQuit) {
            quit();
        }
    }
    else {
        // ブロック防止用定期出力
        if (sync_time > 0) {
            spawn(
                function(x) {
                    while (isExec) {
                        java.lang.Thread.sleep(sync_time);print("#");
                    }
                });
        }

        webTest.initialize.browser.forEach(
            function (browser, index) {
                var browserName = webTest.setDriver(index);
                if (browserName != '') {
                    webTest.output('browser:' + browserName);

                    webTest.baseDir = webTest.initialize.baseDir
                        + webTest.browser.label
                        + java.io.File.separator;
                    new java.io.File(webTest.baseDir).mkdirs();
                    webTest.runner();
                    webTest.driver.quit();
                }
            }
        );
    }
} catch (x) {
    print (x.name);
    print (x.message);
    print (x.fileName);
    print (x.lineNumber);
} finally {
    isExec = false;
}
