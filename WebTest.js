load("UnitTest.js");
importPackage(org.openqa.selenium);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.support.ui);
importPackage(org.openqa.selenium.interactions);

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

    // テスト読み込み
    this.loadTest = function (path) {
        var
        testJson
        ,testName
        ;

        eval('testJson = ' + readFile(path));
        this.initialize = testJson.initialize;
        this.elements = testJson.initialize.elements;
        this.baseUrl = testJson.initialize.baseUrl;
        this.testPattern = testJson.test;
        for (testName in testJson.test) {
            this[testName] = function(name) {
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
        this.isMakeDoc = true;

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
                            + self[testData.command[0]](testData)
                            .replace(/\r?\n/g, '\\n'));
            }
        }
        ;

        // テストリストの作成
        for (testName in this.testPattern) {
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

        if (this.testPattern['setUp']) {
            self.output('大項目:setUp');
            makeDocMain('setUp');
        }
        if (this.testPattern['tearDown']) {
            self.output('大項目:tearDown');
            makeDocMain('tearDown');
        }

        for (i = 0; i < testList.length; i++) {
            testName = testList[i];
            self.output('大項目:' + testName);
            makeDocMain(testName);
        }
        
        this.isMakeDoc = false;
    };

    // エレメント取得
    this.getElement = function (path) {
        var
        pathList = path.split('/')
        ,element = this.elements
        ,xpath = ''
        ,by
        ,i
        ;

        for (i = 0; i < pathList.length; i++) {
            element = element[pathList[i]];
            if (element.by.ByXPath) {
                // XPath指定
                by = By.ByXPath(xpath + element.by.ByXPath);
                xpath = xpath + element.by.ByXPath;
            }
            else if (element.by.ById) {
                // ID指定
                by = By.ById(element.by.ById);
            }
            else if (element.by.ByLinkText) {
                // その他
                by = By.ByLinkText(element.by.ByLinkText);
            }
            // 見つかるまで待つ
            try {
                element.element = 
                    new WebDriverWait(this.driver, this.timeout).until(
                        ExpectedConditions.presenceOfElementLocated(by));
            } catch (x) {
                throw new Error("要素がみつかりません:" + path
                                + '(' + x.message + ')');
            }

            if (element.by.ById) {
                xpath = xpath + '//' + element.element.getTagName()
                    + "[@id='" + element.by.ById + "']";
            }

        }

        // エレメントを返す
        return element.element;
    };
    // テスト実行
    this.executeTest = function (testName) {
        var
        testList = self.testPattern[testName]
        ,testData
        ,i
        ,status
        ,message
        ;

        for (i = 0; i < testList.length; i++) {
            testData = testList[i];
            try {
                if (self[testData.command[0]]) {
                    // コマンド実行
                    self[testData.command[0]](testData, testName, i + 1);
                }
                else {
                    throw new Error('unknown command ' + testData.command[0]);
                }
                status = 'ok';
                message = '';
            } catch (x) {
                status = 'not ok';
                message = ' ' + x.message;
                self.capture(testData, testName, i + 1);
            }

            if (self.isCapture) {
                self.capture(testData, testName, i + 1);
            }

            print ('    ' + status + ' ' + (i + 1) + ' - ' + testData.comment
                   + message);
            if (status != 'ok' && !testData.error_continue) {
                print ('    1..' + (i + 1));
                throw new Error('中断します。');
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

    // コマンド一覧
    this.open = function (testData) {
        if (this.isMakeDoc) {
            return 'ベースアドレス+「' + testData.command[1] + '」を開く。';
        }

        this.driver.get(this.baseUrl + testData.command[1]);
        
        return null;
    };
    this.click = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + 'をクリックする。';
        }
        this.getElement(testData.command[1]).click();

        return null;
    };
    this.quit = function (testData) {
        if (this.isMakeDoc) {
            return 'ブラウザを終了する。';
        }

        this.driver.quit();

        return null;
    };
    this.isEnabled = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1]) + 'が'
                + (testData.command[2] ? '有効' : '無効') + 'であること。';
        }

        var
        element = this.getElement(testData.command[1])
        ,isEnabled = function () {
            return element.isEnabled() && element.isDisplayed();  
        };
        try {
            new WebDriverWait(this.driver, this.timeout).until(
                new com.google.common.base.Function(
                    {apply : function () {
                         if (isEnabled() == testData.command[2]) {
                             return true;
                         }
                         return null;
                     }
                    }));
        } catch (x) {
        }
        this.assertEquals(testData.command[2], isEnabled());

        return null;
    };
    this.alert = function (testData) {
        if (this.isMakeDoc) {
            return 'アラートダイアログ「' + testData.command[1]
                + '」が出現すること。（その後「'
                + ( testData.command[2] ? 'OK' : 'キャンセル')
                + '」をクリック）';
        }

        // アラートがでるまで待つ
        var alert;
        try {
            alert = new WebDriverWait(this.driver, this.timeout).until(
                ExpectedConditions.alertIsPresent());
        } catch (x) {
            throw new Error('ダイアログが出現しません。');
        }
        if (testData.command[1]) {
            this.assertEquals(testData.command[1],alert.getText());
        }
        if (testData.command[2]) {
            alert.accept();
        }
        else {
            alert.dismiss();
        }

        return null;
    };
    this.getText = function (testData) {
        if (this.isMakeDoc) {
            if (testData.command[2] == '') {
                return this.makeReadableElement(testData.command[1])
                    + 'になにも表示されていないこと。';
            }
            else {
                return this.makeReadableElement(testData.command[1])
                    + 'に「' + testData.command[2] + '」が表示されていること。';
            }
        }
        var
        element = this.getElement(testData.command[1])
        ,getText = function () {
            if (element.getTagName() == 'input') {
                // inputタグの場合
                return element.getAttribute('value');
            }
            else {
                return element.getText();
            }
        }
        ;
        try {
            new WebDriverWait(this.driver, this.timeout).until(
                new com.google.common.base.Function(
                    {apply : function () {
                         if (getText() == testData.command[2]) {
                             return true;
                         }
                         return null;
                     }
                    }));
        } catch (x) {
        }
        this.assertEquals(testData.command[2], getText());

        return null;
    };
    this.dragAndDrop = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + 'から'
                + this.makeReadableElement(testData.command[2])
                + 'にドラッグアンドドロップする。';
        }
        var
        element1 = this.getElement(testData.command[1])
        ,element2 = this.getElement(testData.command[2]);

        new Actions(this.driver).clickAndHold(element1)
            .moveToElement(element2).release(element2).build().perform();

        return null;
    };
    this.capture = function (testData, testName, no) {
        if (this.isMakeDoc) {
            return '画面キャプチャ。';
        }
        var
        baseFilename = this.initialize.baseDir + testName + no
        ,out
        ,tmpfile
        ;

        try {
            // アラートダイアログ出現中はとれない
            this.driver.switchTo().alert();
            return null;
        } catch (x) {

        }

        // 画面キャプチャ
        try {
            new java.io.File(baseFilename + '.png').delete();
            tmpfile = this.driver.getScreenshotAs(OutputType.FILE);
            new java.io.File(tmpfile).renameTo(
                new java.io.File(baseFilename + '.png'));
        } catch (x) {
            this.output('png capture');
            this.output(x.message, this.output.status.warning);
        }
        
        // HTML出力
        try {
            out = new java.io.PrintWriter(baseFilename + '.html');
            out.print(this.driver.getPageSource());
            out.close();
        } catch (x) {
            this.output('html capture');
            this.output(x.message, this.output.status.warning);
        }

        this.output('キャプチャ:' + baseFilename);

        return null;
    };
    this.selectByValue = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + 'の「'
                + testData.command[2]
                + '」を選択する。';
        }
        var
        selectElement = this.getElement(testData.command[1])
        ;

        if (selectElement.getTagName() != 'select') {
            throw new Error(testData.command[1] + 'はselectではありません。');
        }

        new Select(selectElement).selectByValue(testData.command[2]);

        return null;
    };
    this.input = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + 'に「'
                + testData.command[2]
                + '」を入力する。';
        }
        var
        element = this.getElement(testData.command[1])
        ;

        element.sendKeys(testData.command[1]);

        return null;
    };
};
WebTest.prototype = new UnitTest();
