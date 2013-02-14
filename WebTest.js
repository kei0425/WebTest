load("UnitTest.js");
importPackage(org.openqa.selenium);
importPackage(org.openqa.selenium.support.ui);
importPackage(org.openqa.selenium.interactions);

importPackage(org.openqa.selenium.remote);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.ie);
importPackage(org.openqa.selenium.chrome);

function convertJavaArrayToJsArray(javaArray) {
    var
    jsArray = []
    ,iterator
    ,i
    ;
    if (javaArray.iterator) {
        // イテレータがある場合
        iterator = javaArray.iterator();

        while (iterator.hasNext()) {
            jsArray.push(iterator.next());
        }
    }
    else {
        // 配列の場合
        for (i = 0; i < javaArray.size(); i++) {
            jsArray.push(javaArray.get(i));
        }
    }
    return jsArray;
}

var WebTest = function (params) {
    var self = this;
    params = params || {};
    /**
     * browser
     */
    this.browser = params.browser;
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
     * スキップ先
     */
    this.skipToComment = '';
    /**
     * リトライするか？
     */
    this.isRetry = true;
    /**
     * テストステータス
     */
    this.testStatus = null;
    /**
     * 戻り先インデックス
     */
    this.backIndex = -1;
    /**
     * 次が条件文か
     */
    this.isNextTest = false;
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
        ,j
        ,status
        ,message
        ,retryIndex = -1
        ,retryCount
        ,retryCommand = [
            'open'
            ,'click'
            ,'dragAndDrop'
            ,'clear'
            ,'gridRender'
        ]
        ;

        for (i = 0; i < testList.length; i++) {
            self.isRetry = true;
            testData = testList[i];

            if (self.skipToComment != '' && !self.testStatus) {
                // スキップ設定済の場合
                if (self.skipToComment == testData.comment) {
                    self.skipToComment = '';
                }
                else {
                    print ('    skip ' + (i + 1) + ' - ' + testData.comment);
                    continue;
                }
            }

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
                if (!self.testStatus) {
                    self.commandList.capture.func(testData, testName, i + 1);
                }
            }

            print ('    ' + status + ' ' + (i + 1) + ' - ' + testData.comment
                   + message);

            if (0 <= self.backIndex) {
                // バック
                i = self.backIndex - 1;
                self.backIndex = -1;
            }
            else if (self.isNextTest) {
                self.isNextTest = false;
            }
            else if (self.testStatus) {
                // 条件の場合
                if (status != self.testStatus) {
                    // ステータスが異る場合スキップしない
                    self.skipToComment = '';
                }

                self.testStatus = null;
            }
            else {
                if (status != 'ok') {
                    if (self.isRetry && retryIndex >= 0
                        && self.retryMax > retryCount) {
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

    /**
     * コメントが存在するかチェック
     */
    function isCommentExist(comment, testName, no) {
        var
        i
        ,testList = self.testPattern[testName]
        ;
        no = no || 0;
        for (i = no; i < testList.length; i++) {
            if (testList[i].comment == comment) {
                return true;
            }
        }

        return false;
    }

    /**
     * サブコマンド
     */
    this.subcommand = {
        '$s' : function (n, x) {
            if (self.isMakeDoc) {
                return (x ? ('「' + x + '」') : '任意の文字を')
                    + n + '文字';
            }

            var r = '';
            x = x || 'a';

            for (;0 < n; n--) {
                r += x;
            }
            
            return r;
        }
    };

    /**
     * コマンド呼出
     */
    this.command = function () {
        var
        args
        ,testName
        ,no
        ,comment
        ;
        if (self.commandList[arguments[0]]) {
            // コマンド指定
            args = arguments;
            testName = 'テスト';
            comment = 'コマンド指定';
            no = 1;
        }
        else  {
            if (self.testPattern[arguments[0]]) {
                // 第１引数をテストパターンに設定
                testName = arguments.shift;
            }
            else {
                // 最初のキーを取得
                for (testName in self.testPattern) {
                    if (testName.lastIndexOf('1', 0) == 0) {
                        break;
                    }
                }
            }

            if (self.testPattern[testName][arguments[0] - 1]) {
                // no指定の場合
                no = arguments[0];
                args = self.testPattern[testName][arguments[0] - 1].command;
                comment = self.testPattern[testName][arguments[0] - 1].comment;
            }
            else {
                // no指定以外はcomment指定とみなす
                for (no = 0; no < self.testPattern[testName].length; no++) {
                    if (self.testPattern[testName].comment == arguments[0]) {
                        args = self.testPattern[testName][no].command;
                        no--;
                        comment = arguments[0];
                        break;
                    }
                }
            }
        }

        if (args) {
            print (testName + ':' + no + ':' + comment);
            if (self.commandList[args[0]]
                .func({command:args}, testName, no) == null) {
                print('ok');
            }
        }
        else {
            print('引数エラー');
        }
    };

    // コマンド一覧
    this.commandList = {
        open : {
            comment : '指定された「URL」を開く。'
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
            comment : 'タイトルを確認する。'
            ,argList : ['比較タイトル']
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
            comment : '「要素」の「プロパティ」を確認する。'
            ,argList : ['要素', 'プロパティ', '比較値']
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
            comment : '「要素」をクリックする。'
            ,argList : ['要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'をクリックする。';
                }
                new WebDriverWait(self.driver, self.timeout).until(
                    new com.google.common.base.Function(
                        {apply : function () {
                             try {
                                 self.getElement(testData.command[1]).click();

                                 return true;
                             } catch (x) {
                                 return false;
                             }
                         }}));


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
            comment : '「要素」が有効/無効かチェックする。'
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
            comment : 'ダイアログが出現し、出力を確認し、ボタンを押す。'
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
            comment : '「要素」のテキストを確認する。'
            ,argList : ['要素', '比較テキスト']
            ,func : function (testData) {
                var
                element
                ,match
                ,expect = testData.command[2]
                ;

                match = testData.command[2].match(/^(\$[^(]+)(\([^(]*\))$/);
                if (match && self.subcommand[match[1]]) {
                    // 関数指定
                    expect = eval('self.subcommand["'
                                  + match[1] + '"]'
                                  + match[2]);
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + 'に'
                            + expect
                            + 'が表示されていること。';
                    }
                }
                else if (self.isMakeDoc) {
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

                element = self.getElement(testData.command[1]);

                self.waitAssert(
                    expect
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
            comment : '「要素」の表示確認。'
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
            comment : '「要素」にマウス移動する。'
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
            comment : '「ドラッグ要素」から「ドロップ要素」にマウスをドラッグ＆ドロップする。'
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
            comment : 'select「要素」の選択値を選択する。'
            ,argList : ['要素', '選択値']
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
            comment : '「要素」に「値」を入力する。'
            ,argList : ['要素', '値']
            ,func : function (testData) {
                var
                keyData
                ,element
                ,match
                ;
                if (!testData.command[2]) {
                    throw new Error('引数２が足りません。');
                }

                match = testData.command[2].match(/^(\$[^(]+)(\([^(]*\))$/);
                if (match && self.subcommand[match[1]]) {
                    // 関数指定
                    keyData = eval('self.subcommand["'
                                   + match[1] + '"]'
                                   + match[2]);
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + 'に'
                            + keyData
                            + 'を入力する。';
                    }
                }
                else if (testData.command[2].lastIndexOf('Keys.', 0) == 0) {
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
            comment : '「要素」の値をクリアする。'
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
            comment : '「要素」で選択した値を確認する。'
            ,argList : ['要素', '比較値']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'が「'
                        + testData.command[2]
                        + '」を選択していること。';
                }
                var
                baseElement = self.getElement(testData.command[1])
                ,selectElement
                ,text = ''
                ,getSelectText
                ;

                try {
                    selectElement = baseElement
                        .findElement(By.ByXPath('descendant-or-self::select'));
                    // selectが存在する場合
                    getSelectText = function () {
                        return convertJavaArrayToJsArray(
                            new Select(selectElement)
                                .getAllSelectedOptions()).map(
                                    function(x) {
                                        return x.getText();
                                    }).join('/');
                    };
                } catch (x) {
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
        ,clearCookies : {
            comment : 'クッキーをクリアする。'
            ,argList : []
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'クッキークリア';
                }
                self.driver.manage().deleteAllCookies();
                
                return null;
            }
        }
        ,nodeCount : {
            comment : '「要素」の子要素数を確認する。'
            ,argList : ['要素', '比較子要素数']
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
                        return element.findElementsByXPath('*').size();
                    }
                );
                
                return null;
            }
        }
        ,ifskip : {
            comment : '次のテストが成立したら「項目名」までスキップする。'
            ,argList : ['項目名']
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '次の項目のテストが成立した場合「'
                    + testData.command[1]
                    + '」までスキップする。';
                }

                if (!isCommentExist(testData.command[1], testName, no)) {
                    self.isRetry = false;
                    throw new Error('「' + testData.command[1]
                                    + '」がみつかりません');
                    
                }

                self.isNextTest = true;
                self.testStatus = 'ok';
                self.skipToComment = testData.command[1];
                
                return null;
            }
        }
        ,ifnotskip : {
            comment : '次のテストが成立しなかったら「項目名」までスキップする。'
            ,argList : ['項目名']
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '次の項目のテストが成立しない場合「'
                    + testData.command[1]
                    + '」までスキップする。';
                }

                if (!isCommentExist(testData.command[1], testName, no)) {
                    self.isRetry = false;
                    throw new Error('「' + testData.command[1]
                                    + '」がみつかりません');
                    
                }

                self.isNextTest = true;
                self.testStatus = 'not ok';
                self.skipToComment = testData.command[1];
                
                return null;
            }
        }
        ,skip : {
            comment : '「項目名」までスキップする。'
            ,argList : ['項目名']
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '「'
                    + testData.command[1]
                    + '」までスキップする。';
                }

                if (!isCommentExist(testData.command[1], testName, no)) {
                    self.isRetry = false;
                    throw new Error('「' + testData.command[1]
                                    + '」がみつかりません');
                    
                }

                self.skipToComment = testData.command[1];
                
                return null;
            }
        }
        ,back : {
            comment : '「項目名」まで戻る。'
            ,argList : ['項目名']
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '「'
                    + testData.command[1]
                    + '」から再実行。';
                }

                var i;

                for (i = no - 2; 0 <= i; i--) {
                    if (self.testPattern[testName][i].comment
                        == testData.command[1]) {
                        break;
                    }
                }

                if (i < 0) {
                    self.isRetry = false;
                    throw new Error('「' + testData.command[1]
                                    + '」がみつかりません');
                }

                print('「' + testData.command[1] + '」から再実行します。');
                self.backIndex = i - 1;
                
                return null;
            }
        }
        ,browser : {
            comment : 'browser名が「ブラウザ名」か確認する。'
            ,argList : ['ブラウザ名']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ブラウザ名が「'
                    + testData.command[1]
                    + '」であること。';
                }

                self.assertEquals(testData.command[1],
                                  self.driver.getCapabilities().getBrowserName());

                return null;
            }
        }
        ,setting : {
            comment : 'ブラウザ設定の「項目」が「設定値」か確認する。'
            ,argList : ['項目', '設定値']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ブラウザ設定の「'
                    + testData.command[1]
                    + '」が「'
                    + testData.command[2]
                    + '」であること。';
                }

                self.assertEquals(testData.command[2],
                                  self.browser[testData.command[1]]);

                return null;
            }
        }
        ,script : {
            comment : 'ブラウザ上で指定されたスクリプトを実行する。'
            ,argList : ['スクリプト', '(確認戻り値)']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (testData.command[2]) {
                        return 'ブラウザ上で「'
                            + testData.command[1]
                            + '」を実行した結果が「'
                            + testData.command[2]
                            + '」であること。';
                    }
                    else {
                        return 'ブラウザ上で「'
                            + testData.command[1]
                            + '」を実行する。';
                    }
                }

                var
                ret
                ,command = testData.command[1]
                ;

                if (testData.command[2] && command.lastIndexOf(0, 'return') < 0) {
                    // 戻り値を確認かつreturnで始まっていない場合はreturnを追加
                    command = 'return ' + command;
                }

                ret = self.driver.executeScript(command);

                if (testData.command[2]) {
                    self.assertEquals(testData.command[2], ret);
                }

                return null;
            }
        }
        ,setTimeout : {
            comment : 'ブラウザ上で指定されたスクリプトを遅延実行する。'
            ,argList : ['スクリプト', '(遅延時間)']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (!testData.command[2]) {
                        return 'ブラウザ上で「'
                        + testData.command[1]
                        + '」を遅延実行する。';
                    }
                    else {
                        return 'ブラウザ上で「'
                            + testData.command[1]
                            + '」を「'
                            + testData.command[2]
                            + '」mm秒遅れて実行する。';
                    }
                }

                var
                time = testData.command[2] || 0
                ,command = 'setTimeout(function (){'
                    + testData.command[1]
                    + '},'
                    + time
                    + ')'
                ;

                self.driver.executeScript(command);

                return null;
            }
        }
        ,switchWindow : {
            comment : 'ウインドウ切替'
            ,argList : ['切替先ウインドウタイトル']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ウインドウを「'
                        + testData.command[1]
                        + '」に切り換える';
                }

                try {
                    new WebDriverWait(self.driver, self.timeout).until(
                        new com.google.common.base.Function(
                            {apply : function () {
                                 return convertJavaArrayToJsArray(
                                     self.driver.getWindowHandles()).some(
                                         function (x) {
                                             if (self.driver.switchTo().window(x).getTitle() == testData.command[1]) {
                                                 self.driver = self.driver.switchTo().window(x);
                                                 return true;
                                                 
                                             }
                                             else {
                                                 return false;
                                             }
                                         });}}));
                } catch (x) {
                    throw new Error("指定されたウインドウがみつかりません:"
                                    + testData.command[1]);
                }

                return null;
            }
        }
        ,closeWindow : {
            comment : 'ウインドウ閉じる'
            ,argList : []
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return 'ウインドウを閉じ、切り換える';
                }

                // カレントウインドウを閉じる
                self.driver.close();
                // ウインドウ切替
                self.driver.switchTo().window(
                    self.driver.getWindowHandles().iterator().next());

                return null;
            }
        }
        ,gridRowsNum : {
            comment : '「要素」のグリッドの有効行数を取得する。'
            ,argList : ['要素', '個数']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'のグリッドの有効行数が「'
                        + testData.command[2]
                        + '」であること。';
                }
                var
                element = self.getElement(testData.command[1])
                ;

                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        return convertJavaArrayToJsArray(
                            element.findElementsByXPath(
                                'descendant-or-self::tr')).filter(
                                    function (node) {
                                        return node.getText().trim() != '';
                                    }
                                ).length - 1;
                    }
                );

                return null;
            }
        }
        ,gridRender : {
            comment : '「要素」のグリッドをレンダリングする。'
            ,argList : ['要素']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + 'のグリッドをレンダリングする。';
                }
                var
                dummyRowXPath = testData.command[1]
                    + "//tr[td/@style='display: none;']/td[1]"
                ,dummyRowElement
                ;
                if (self.driver.getCapabilities().getBrowserName()
                    == 'internet explorer') {
                    // IEの場合はパスが異る
                    dummyRowXPath = testData.command[1]
                        + "//tr[@idd='__filler__']/td[1]";
                }
                try {
                    while (true) {
                        dummyRowElement =  self.getElement(dummyRowXPath);

                        try {
                            dummyRowElement.click();
                        } catch (x) {
                        }
                        java.lang.Thread.sleep(500);
                    }
                } catch (x) {
                }

                return null;
            }
        }
        ,custom : {
            comment : '「ファイル名」の拡張コマンドを実行する。'
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
