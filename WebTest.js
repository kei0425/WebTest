load("UnitTest.js");
importPackage(org.openqa.selenium);
importPackage(org.openqa.selenium.support.ui);
importPackage(org.openqa.selenium.interactions);

importPackage(org.openqa.selenium.remote);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.ie);


function convertJavaArrayToJsArray(javaArray) {
    var
    jsArray = []
    ,i;
    for (i = 0; i < javaArray.size(); i++) {
        jsArray.push(javaArray.get(i));
    }
    return jsArray;
}

var WebTest = function (params) {
    var self = this;
    params = params || {};
    /**
     * タイムアウト
     */
    this.timeout = params.timeout || 5;
    /**
     * ドライバー
     */
    this.driver = params.driver;
    /**
     * ベースURL
     */
    this.baseUrl = params.baseUrl;
    /**
     * キャプチャ
     */
    this.isCapture = params.capture || false;
    /**
     * テスト再施行最大数
     */
    this.retryMax = params.retryMax || 0;
    /**
     * カスタムコマンド
     */
    this.customFunction = {};

    /**
     *  テスト読み込み
     */
    this.loadTest = function (path) {
        var
        testJson
        ,testName
        ;

        eval('testJson = ' + readFile(path));
        self.initialize = testJson.initialize;
        self.elements = testJson.initialize.elements;
        self.baseUrl = testJson.initialize.baseUrl;
        self.baseDir = testJson.initialize.baseDir;
        self.testPattern = testJson.test;
        for (testName in testJson.test) {
            self[testName] = function(name) {
                return function () {
                    print('実行:' + name);
                    self.executeTest(name);
                };
            }(testName);
        }
    };

    /**
     * ドキュメント作成
     */
    this.makeDoc = function () {
        self.isMakeDoc = true;

        var
        testList = []
        ,testName
        ,i
        ,makeDocMain = function (testName) {
            var
            testList = self.testPattern[testName]
            ,testData
            ,i
            ;

            for (i = 0; i < testList.length; i++) {
                testData = testList[i];
                self.output('    ' + (i + 1) + ' '
                            + self.commandList[testData.command[0]]
                            .func(testData)
                            .replace(/\r?\n/g, '\\n'));
            }
        }
        ;

        // テストリストの作成
        for (testName in self.testPattern) {
            if (/^\d/.test(testName)) {
                testList.push(testName);
            }
        }

        testList.sort(function (a,b) {
                          var
                          num_a = a.match(/^\d+/),
                          num_b = b.match(/^\d+/)
                          ;

                          return num_b - num_a;
                      });

        if (self.testPattern['setUp']) {
            self.output('大項目:setUp');
            makeDocMain('setUp');
        }
        if (self.testPattern['tearDown']) {
            self.output('大項目:tearDown');
            makeDocMain('tearDown');
        }

        for (i = 0; i < testList.length; i++) {
            testName = testList[i];
            self.output('大項目:' + testName);
            makeDocMain(testName);
        }
        
        self.isMakeDoc = false;
    };

    function makeFrameElement(element, currentWindowId, frame) {
        return {
            element : element
            ,clear : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    this.element.clear();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,click : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    this.element.click();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,findElement : function (by) {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return makeFrameElement(this.element.findElement(by)
                                            , currentWindowId, frame);
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getAttribute : function (name) {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getAttribute(name);
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getCssValue : function (propertyName) {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getCssValue(propertyName);
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getLocation : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getLocation();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getSize : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getSize();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getTagName : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getTagName();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getText : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.getText();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isDisplayed : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.isDisplayed();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isEnabled : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.isEnabled();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isSelected : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.isSelected();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,sendKeys : function (keysToSend) {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.sendKeys(keysToSend);
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,submit : function () {
                try {
                    // フレーム切替
                    self.driver.switchTo().frame(frame);
            
                    // 実行
                    return this.element.submit();
                } finally {
                    // フレームを戻す
                    self.driver.switchTo().window(currentWindowId);
                }
            }
        };
    }

    /**
     * ロケーター取得
     */
    this.getLocator = function (path) {
        var
        pathList = path.split('/')
        ,element = self.elements
        ,xpath = ''
        ,locator
        ,i
        ,frame
        ,func = function () {
            try {
                return self.driver.findElement(locator);
            } catch (x) {
                return null;
            }
        }
        ,frameFunc = function () {
            var
            currentWindowId = self.driver.getWindowHandle();
            try {
                // フレーム切替
                self.driver.switchTo().frame(frame);
            
                // エレメント取得
                return makeFrameElement(self.driver.findElement(locator)
                                        ,currentWindowId, frame);
            } catch (x) {
                return null;
            } finally {
                // フレームを戻す
                self.driver.switchTo().window(currentWindowId);
            }
        }
        ;

        for (i = 0; i < pathList.length; i++) {
            if (element[pathList[i]]) {
                element = element[pathList[i]];
                if (element.by) {
                    if (element.by.ByXPath) {
                        // XPath指定
                        xpath = xpath + element.by.ByXPath;
                        locator = By.ByXPath(xpath);
                    }
                    else if (element.by.ById) {
                        // ID指定
                        xpath = "//*[@id='" + element.by.ById + "']";
                        locator = By.ById(element.by.ById);
                    }
                    else if (element.by.ByLinkText) {
                        // その他
                        locator = By.ByLinkText(element.by.ByLinkText);
                    }
                    else if (element.by.frame) {
                        // frame
                        frame = element.by.frame;
                        xpath = '//body';
                        locator = By.ByXPath(xpath);
                    }
                }
            }
            else {
                // XPathとみなす
                xpath = xpath + '/' + pathList[i];
                locator = By.ByXPath(xpath);
            }
        }

        // ロケーターを返す
        return {
            frame : frame
            ,locator : locator
            ,getElement : frame ? frameFunc : func
        };
    };

    /**
     *  エレメント取得
     */
    this.getElement = function (path) {
        // 見つかるまで待つ
        var
        locator = self.getLocator(path)
        ,element
        ;
        try {
            new WebDriverWait(self.driver, self.timeout).until(
                new com.google.common.base.Function(
                    {apply : function () {
                         try {
                             element = locator.getElement();

                             return element;
                         } catch (x) {
                             return false;
                         }
                     }}));
        } catch (x) {
            throw new Error("要素がみつかりません:" + path
                            + '(' + x.message + ')');
        }

        return element;
    };
    /**
     *  テスト実行
     */
    this.executeTest = function (testName) {
        var
        testList = self.testPattern[testName]
        ,testData
        ,i
        ,status
        ,message
        ,retryIndex = -1
        ,retryCount
        ,retryCommand = [
            'open'
            ,'click'
            ,'dragAndDrop'
        ]
        ;

        for (i = 0; i < testList.length; i++) {
            testData = testList[i];

            if (self.isCapture && testData.command[0] != 'alert') {
                self.commandList.capture.func(testData, testName, i + 1);
            }

            try {
                if (self.commandList[testData.command[0]]) {
                    // コマンド実行
                    self.commandList[testData.command[0]]
                        .func(testData, testName, i + 1);
                }
                else {
                    throw new Error('unknown command ' + testData.command[0]);
                }
                status = 'ok';
                message = '';
            } catch (x) {
                status = 'not ok';
                message = ' ' + x.message;
                self.commandList.capture.func(testData, testName, i + 1);
            }

            print ('    ' + status + ' ' + (i + 1) + ' - ' + testData.comment
                   + message);
            if (status != 'ok') {
                if (retryIndex >= 0 && self.retryMax > retryCount) {
                    retryCount++;
                    print ('retryします。(' + retryCount + '回目)');
                    i = retryIndex - 1;
                }
                else if (!testData.error_continue) {
                    print ('    1..' + (i + 1));
                    throw new Error('中断します。');
                }
            }
            else if (retryCommand.indexOf(testData.command[0]) >= 0) {
                // retryポイント設定
                if (retryIndex != i) {
                    retryIndex = i;
                    retryCount = 0;
                }
            }
        }
        print ('    1..' + testList.length);
    };

    /**
     * エレメントを読み易い形に変更
     */
    this.makeReadableElement = function (path) {
        return path.split('/')
            .map(function(x){return '「' + x + '」';})
            .join('の');
    };

    /**
     * 待機アサート
     */
    this.waitAssert = function (expect, func) {
        var
        result;
        ;
        try {
            new WebDriverWait(self.driver, self.timeout).until(
                new com.google.common.base.Function(
                    {apply : function () {
                         try {
                             result = func();

                             if (result == expect) {
                                 return true;
                             }

                             return false;
                         } catch (x) {
                             return false;
                         }
                     }
                    }));
        } catch (x) {
        }

        self.assertEquals(expect, result);
    };

    /**
     * 待機
     */
    this.waitExpectedCondition = function (expectedcondition) {
        try {
            new WebDriverWait(self.driver, self.timeout).until(
                expectedcondition
            );
        } catch (x) {
        }
    };
    /**
     * コマンド一覧出力
     */
    this.outputCommandList = function () {
        var
        command
        ,data
        ;
        for (command in self.commandList) {
            data = self.commandList[command];
            self.output(
                [command, data.comment].concat(data.argList).join('\t')
            );
        }
    };

    // コマンド一覧
    this.commandList = {
        open : {
            comment : '開く'
            ,argList : ['URL(baseURL以降)']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ベースアドレス+「' + testData.command[1]
                        + '」を開く。';
                }

                self.driver.get(self.baseUrl + testData.command[1]);
        
                return null;
            }
        }
        ,title : {
            comment : 'タイトル確認'
            ,argList : ['タイトル']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'タイトルが「' + testData.command[1]
                        + '」であること。';
                }

                self.waitExpectedCondition(
                    ExpectedConditions.titleIs(testData.command[1])
                );

                self.assertEquals(testData.command[1], self.driver.getTitle());

                return null;
            }
        }
        ,property : {
            comment : 'プロパティ'
            ,argList : ['要素', 'プロパティ', '値']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'の' + testData.command[2] + 'が'
                        + testData.command[3] + 'であること。';
                }
                var
                element = self.getElement(testData.command[1]);
                self.waitAssert(
                    testData.command[3]
                    ,function () {
                        return eval('element.' + testData.command[2]);
                    }
                );

                return null;
            }
        }
        ,click : {
            comment : 'クリック'
            ,argList : ['要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'をクリックする。';
                }
                self.getElement(testData.command[1]).click();

                return null;
            }
        }
        ,quit : {
            comment : '終了'
            ,argList : []
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ブラウザを終了する。';
                }

                self.driver.quit();

                return null;
            }
        }
        ,isEnabled : {
            comment : '有効/無効チェック'
            ,argList : ['要素', 'TRUE＝有効/FALSE＝無効']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1]) + 'が'
                        + (testData.command[2] ? '有効' : '無効')
                        + 'であること。';
                }

                var
                element = self.getElement(testData.command[1])
                ;

                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        return element.isEnabled() && element.isDisplayed();  
                    }
                );
                
                return null;
            }
        }
        ,alert : {
            comment : 'ダイアログ確認'
            ,argList : ['比較ダイアログ文字列'
                        ,'TRUE＝「OK」押下/FALSE＝「キャンセル」押下']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'アラートダイアログ「' + testData.command[1]
                        + '」が出現すること。（その後「'
                        + ( testData.command[2] ? 'OK' : 'キャンセル')
                        + '」をクリック）';
                }

                // アラートがでるまで待つ
                var
                alert
                ,message
                ,retryCount = 0;
                while (true) {
                    try {
                        alert = new WebDriverWait(self.driver, self.timeout)
                            .until(
                                ExpectedConditions.alertIsPresent());

                        message = alert.getText();

                        if (testData.command[2]) {
                            alert.accept();
                        }
                        else {
                            alert.dismiss();
                        }

                        break;
                    } catch (x) {
                        if (++retryCount > 3) {
                            throw new Error('ダイアログが出現しません。');
                        }
                    }
                }

                if (testData.command[1]) {
                    self.assertEquals(testData.command[1],message);
                }

                return null;
            }
        }
        ,getText : {
            comment : '表示テキスト確認'
            ,argList : ['要素', '比較テキスト']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (testData.command[2] == '') {
                        return self.makeReadableElement(testData.command[1])
                            + 'になにも表示されていないこと。';
                    }
                    else {
                        return self.makeReadableElement(testData.command[1])
                            + 'に「' + testData.command[2]
                            + '」が表示されていること。';
                    }
                }
                var
                element = self.getElement(testData.command[1])
                ;
                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        if (element.getTagName() == 'input') {
                            // inputタグの場合
                            return element.getAttribute('value');
                        }
                        else {
                            return element.getText();
                        }
                    }
                );

                return null;
            }
        }
        ,isDisplay : {
            comment : '要素表示確認'
            ,argList : ['要素', 'TRUE=表示/FALSE=非表示']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (testData.command[2]) {
                        return self.makeReadableElement(testData.command[1])
                            + 'が表示されていること。';
                    }
                    else {
                        return self.makeReadableElement(testData.command[1])
                            + 'が表示されていないこと。';
                    }
                }

                var locator = self.getLocator(testData.command[1]);

                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        var
                        element = locator.getElement();
                        ;

                        if (element && element.isDisplayed()) {
                            // みつかった場合
                            return true;
                        }
                            
                        // みつからない場合
                        return false;
                    }
                );

                return null;
            }
        }
        ,mouseMove : {
            comment : 'マウス移動'
            ,argList : ['要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'マウスを'
                        + self.makeReadableElement(testData.command[1])
                        + 'に移動する。';
                }
                var
                element1 = self.getElement(testData.command[1])
                ;

                new Actions(self.driver).moveToElement(element1).build()
                    .perform();

                return null;
            }
        }
        ,dragAndDrop : {
            comment : 'ドラッグ＆ドロップ'
            ,argList : ['ドラッグ要素', 'ドロップ要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'から'
                        + self.makeReadableElement(testData.command[2])
                        + 'にドラッグアンドドロップする。';
                }
                var
                element1 = self.getElement(testData.command[1])
                ,element2 = self.getElement(testData.command[2]);

                new Actions(self.driver).clickAndHold(element1)
                    .moveToElement(element2).release(element2).build().perform();

                return null;
            }
        }
        ,capture : {
            comment : '画面キャプチャ'
            ,argList : []
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '画面キャプチャ。';
                }
                var
                baseFilename = self.baseDir + testName + no
                ,out
                ,tmpfile
                ;

                // 画面キャプチャ
                try {
                    new java.io.File(baseFilename + '.png').delete();
                    
                    if (self.driver.getScreenshotAs) {
                        // ローカルの場合
                        tmpfile = self.driver.getScreenshotAs(OutputType.FILE);
                    }
                    else {
                        // リモートの場合
                        tmpfile = new Augmenter().augment(self.driver)
                            .getScreenshotAs(OutputType.FILE);
                    }
                    new java.io.File(tmpfile).renameTo(
                        new java.io.File(baseFilename + '.png'));
                } catch (x) {
                    self.output('png capture error');
                    self.output(x.message, self.output.status.warning);
                }
        
                // HTML出力
                try {
                    out = new java.io.PrintWriter(baseFilename + '.html');
                    out.print(self.driver.getPageSource());
                    out.close();
                } catch (x) {
                    self.output('html capture error');
                    self.output(x.message, self.output.status.warning);
                }

                self.output('キャプチャ:' + baseFilename);

                return null;
            }
        }
        ,selectByValue : {
            comment : 'select値選択'
            ,argList : ['要素', '値']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'の「'
                        + testData.command[2]
                        + '」を選択する。';
                }
                var
                selectElement = self.getElement(testData.command[1])
                ;

                try {
                    selectElement = selectElement
                        .findElementByXPath('descendant-or-self::select');
                } catch (x) {
                    throw new Error(testData.command[1]
                                    + 'にはselectはありません。');
                }

                new Select(selectElement).selectByValue(testData.command[2]);

                return null;
            }
        }
        ,input : {
            comment : '値入力'
            ,argList : ['要素', '値']
            ,func : function (testData) {
                var
                keyData
                ,element
                ;
                if (!testData.command[2]) {
                    throw new Error('引数２が足りません。');
                }
                if (testData.command[2].lastIndexOf('Keys.', 0) == 0) {
                    // キー指定
                    keyData = eval(testData.command[2]);
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + 'に「'
                            + testData.command[2].split('.', 2)[1]
                            + 'キー」を入力する。';
                    }
                }
                else {
                    // 文字列指定
                    keyData = testData.command[2];
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + 'に「'
                            + keyData
                            + '」を入力する。';
                    }
                }
        

                element = self.getElement(testData.command[1]);

                element.sendKeys(keyData);

                return null;
            }
        }
        ,clear : {
            comment : '値クリア'
            ,argList : ['要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'をクリアする。';
                }
                var
                element = self.getElement(testData.command[1])
                ;

                element.clear();

                return null;
            }
        }
        ,getSelected : {
            comment : '選択した値の取得'
            ,argList : ['要素', '値']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'が「'
                        + testData.command[2]
                        + '」を選択していること。';
                }
                var
                baseElement = self.getElement(testData.command[1])
                ,selectElements
                ,text = ''
                ,getSelectText
                ;

                selectElements = baseElement
                    .findElementsByXPath('descendant-or-self::select');
                if (selectElements.size() > 0) {
                    // selectが存在する場合
                    getSelectText = function () {
                        return convertJavaArrayToJsArray(
                            new Select(selectElements.get(0))
                                .getAllSelectAllSelectedOptions()).map(
                                    function(x) {
                                        return x.getText();
                                    });
                    };
                }
                else {
                    // select以外
                    getSelectText = function () {
                        return convertJavaArrayToJsArray(
                            baseElement.findElementsByXPath(
                                "descendant-or-self::*[contains(@class, 'select')]"))
                            .map(
                                function(x) {
                                    return x.getText();
                                }
                            ).join('/');
                    };
                }

                self.waitAssert(
                    testData.command[2]
                    ,getSelectText
                );

                return null;
            }
        }
        ,nodeCount : {
            comment : '子要素数チェック'
            ,argList : ['要素', '子要素数']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'の子要素が'
                        + testData.command[2]
                        + '個であること。';
                }
                var
                element = self.getElement(testData.command[1])
                ;

                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        return element.childNodes.length;
                    }
                );
                
                return null;
            }
        }
        ,custom : {
            comment : '拡張コマンド'
            ,argList : ['ファイル名', '引数1', '引数2']
            ,func : function (testData) {
                if (!self.customFunction[testData.command[1]]) {
                    // 未定義の場合は読み込み
                    self.customFunction[testData.command[1]]
                        = eval(readFile(self.initialize.baseDir
                                        + testData.command[1]));
                }

                // 実行
                return self.customFunction[testData.command[1]](testData);
            }
        }
    };
};
WebTest.prototype = new UnitTest();
