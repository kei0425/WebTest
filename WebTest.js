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
     * �^�C���A�E�g
     */
    this.timeout = params.timeout || 5;
    /**
     * �h���C�o�[
     */
    this.driver = params.driver;
    /**
     * �x�[�XURL
     */
    this.baseUrl = params.baseUrl;
    /**
     * �L���v�`��
     */
    this.isCapture = params.capture || false;
    /**
     * �e�X�g�Ď{�s�ő吔
     */
    this.retryMax = params.retryMax || 0;
    /**
     * �J�X�^���R�}���h
     */
    this.customFunction = {};

    /**
     *  �e�X�g�ǂݍ���
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
                    print('���s:' + name);
                    self.executeTest(name);
                };
            }(testName);
        }
    };

    /**
     * �h�L�������g�쐬
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

        // �e�X�g���X�g�̍쐬
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
            self.output('�區��:setUp');
            makeDocMain('setUp');
        }
        if (self.testPattern['tearDown']) {
            self.output('�區��:tearDown');
            makeDocMain('tearDown');
        }

        for (i = 0; i < testList.length; i++) {
            testName = testList[i];
            self.output('�區��:' + testName);
            makeDocMain(testName);
        }
        
        self.isMakeDoc = false;
    };

    function makeFrameElement(element, currentWindowId, frame) {
        return {
            element : element
            ,clear : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    this.element.clear();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,click : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    this.element.click();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,findElement : function (by) {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return makeFrameElement(this.element.findElement(by)
                                            , currentWindowId, frame);
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getAttribute : function (name) {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getAttribute(name);
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getCssValue : function (propertyName) {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getCssValue(propertyName);
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getLocation : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getLocation();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getSize : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getSize();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getTagName : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getTagName();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,getText : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.getText();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isDisplayed : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.isDisplayed();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isEnabled : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.isEnabled();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,isSelected : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.isSelected();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,sendKeys : function (keysToSend) {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.sendKeys(keysToSend);
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
            ,submit : function () {
                try {
                    // �t���[���ؑ�
                    self.driver.switchTo().frame(frame);
            
                    // ���s
                    return this.element.submit();
                } finally {
                    // �t���[����߂�
                    self.driver.switchTo().window(currentWindowId);
                }
            }
        };
    }

    /**
     * ���P�[�^�[�擾
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
                // �t���[���ؑ�
                self.driver.switchTo().frame(frame);
            
                // �G�������g�擾
                return makeFrameElement(self.driver.findElement(locator)
                                        ,currentWindowId, frame);
            } catch (x) {
                return null;
            } finally {
                // �t���[����߂�
                self.driver.switchTo().window(currentWindowId);
            }
        }
        ;

        for (i = 0; i < pathList.length; i++) {
            if (element[pathList[i]]) {
                element = element[pathList[i]];
                if (element.by) {
                    if (element.by.ByXPath) {
                        // XPath�w��
                        xpath = xpath + element.by.ByXPath;
                        locator = By.ByXPath(xpath);
                    }
                    else if (element.by.ById) {
                        // ID�w��
                        xpath = "//*[@id='" + element.by.ById + "']";
                        locator = By.ById(element.by.ById);
                    }
                    else if (element.by.ByLinkText) {
                        // ���̑�
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
                // XPath�Ƃ݂Ȃ�
                xpath = xpath + '/' + pathList[i];
                locator = By.ByXPath(xpath);
            }
        }

        // ���P�[�^�[��Ԃ�
        return {
            frame : frame
            ,locator : locator
            ,getElement : frame ? frameFunc : func
        };
    };

    /**
     *  �G�������g�擾
     */
    this.getElement = function (path) {
        // ������܂ő҂�
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
            throw new Error("�v�f���݂���܂���:" + path
                            + '(' + x.message + ')');
        }

        return element;
    };
    /**
     *  �e�X�g���s
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
                    // �R�}���h���s
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
                    print ('retry���܂��B(' + retryCount + '���)');
                    i = retryIndex - 1;
                }
                else if (!testData.error_continue) {
                    print ('    1..' + (i + 1));
                    throw new Error('���f���܂��B');
                }
            }
            else if (retryCommand.indexOf(testData.command[0]) >= 0) {
                // retry�|�C���g�ݒ�
                if (retryIndex != i) {
                    retryIndex = i;
                    retryCount = 0;
                }
            }
        }
        print ('    1..' + testList.length);
    };

    /**
     * �G�������g��ǂ݈Ղ��`�ɕύX
     */
    this.makeReadableElement = function (path) {
        return path.split('/')
            .map(function(x){return '�u' + x + '�v';})
            .join('��');
    };

    /**
     * �ҋ@�A�T�[�g
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
     * �ҋ@
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
     * �R�}���h�ꗗ�o��
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

    // �R�}���h�ꗗ
    this.commandList = {
        open : {
            comment : '�J��'
            ,argList : ['URL(baseURL�ȍ~)']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return '�x�[�X�A�h���X+�u' + testData.command[1]
                        + '�v���J���B';
                }

                self.driver.get(self.baseUrl + testData.command[1]);
        
                return null;
            }
        }
        ,title : {
            comment : '�^�C�g���m�F'
            ,argList : ['�^�C�g��']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return '�^�C�g�����u' + testData.command[1]
                        + '�v�ł��邱�ƁB';
                }

                self.waitExpectedCondition(
                    ExpectedConditions.titleIs(testData.command[1])
                );

                self.assertEquals(testData.command[1], self.driver.getTitle());

                return null;
            }
        }
        ,property : {
            comment : '�v���p�e�B'
            ,argList : ['�v�f', '�v���p�e�B', '�l']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '��' + testData.command[2] + '��'
                        + testData.command[3] + '�ł��邱�ƁB';
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
            comment : '�N���b�N'
            ,argList : ['�v�f']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '���N���b�N����B';
                }
                self.getElement(testData.command[1]).click();

                return null;
            }
        }
        ,quit : {
            comment : '�I��'
            ,argList : []
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return '�u���E�U���I������B';
                }

                self.driver.quit();

                return null;
            }
        }
        ,isEnabled : {
            comment : '�L��/�����`�F�b�N'
            ,argList : ['�v�f', 'TRUE���L��/FALSE������']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1]) + '��'
                        + (testData.command[2] ? '�L��' : '����')
                        + '�ł��邱�ƁB';
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
            comment : '�_�C�A���O�m�F'
            ,argList : ['��r�_�C�A���O������'
                        ,'TRUE���uOK�v����/FALSE���u�L�����Z���v����']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return '�A���[�g�_�C�A���O�u' + testData.command[1]
                        + '�v���o�����邱�ƁB�i���̌�u'
                        + ( testData.command[2] ? 'OK' : '�L�����Z��')
                        + '�v���N���b�N�j';
                }

                // �A���[�g���ł�܂ő҂�
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
                            throw new Error('�_�C�A���O���o�����܂���B');
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
            comment : '�\���e�L�X�g�m�F'
            ,argList : ['�v�f', '��r�e�L�X�g']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (testData.command[2] == '') {
                        return self.makeReadableElement(testData.command[1])
                            + '�ɂȂɂ��\������Ă��Ȃ����ƁB';
                    }
                    else {
                        return self.makeReadableElement(testData.command[1])
                            + '�Ɂu' + testData.command[2]
                            + '�v���\������Ă��邱�ƁB';
                    }
                }
                var
                element = self.getElement(testData.command[1])
                ;
                self.waitAssert(
                    testData.command[2]
                    ,function () {
                        if (element.getTagName() == 'input') {
                            // input�^�O�̏ꍇ
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
            comment : '�v�f�\���m�F'
            ,argList : ['�v�f', 'TRUE=�\��/FALSE=��\��']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    if (testData.command[2]) {
                        return self.makeReadableElement(testData.command[1])
                            + '���\������Ă��邱�ƁB';
                    }
                    else {
                        return self.makeReadableElement(testData.command[1])
                            + '���\������Ă��Ȃ����ƁB';
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
                            // �݂������ꍇ
                            return true;
                        }
                            
                        // �݂���Ȃ��ꍇ
                        return false;
                    }
                );

                return null;
            }
        }
        ,mouseMove : {
            comment : '�}�E�X�ړ�'
            ,argList : ['�v�f']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return '�}�E�X��'
                        + self.makeReadableElement(testData.command[1])
                        + '�Ɉړ�����B';
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
            comment : '�h���b�O���h���b�v'
            ,argList : ['�h���b�O�v�f', '�h���b�v�v�f']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '����'
                        + self.makeReadableElement(testData.command[2])
                        + '�Ƀh���b�O�A���h�h���b�v����B';
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
            comment : '��ʃL���v�`��'
            ,argList : []
            ,func : function (testData, testName, no) {
                if (self.isMakeDoc) {
                    return '��ʃL���v�`���B';
                }
                var
                baseFilename = self.baseDir + testName + no
                ,out
                ,tmpfile
                ;

                // ��ʃL���v�`��
                try {
                    new java.io.File(baseFilename + '.png').delete();
                    
                    if (self.driver.getScreenshotAs) {
                        // ���[�J���̏ꍇ
                        tmpfile = self.driver.getScreenshotAs(OutputType.FILE);
                    }
                    else {
                        // �����[�g�̏ꍇ
                        tmpfile = new Augmenter().augment(self.driver)
                            .getScreenshotAs(OutputType.FILE);
                    }
                    new java.io.File(tmpfile).renameTo(
                        new java.io.File(baseFilename + '.png'));
                } catch (x) {
                    self.output('png capture error');
                    self.output(x.message, self.output.status.warning);
                }
        
                // HTML�o��
                try {
                    out = new java.io.PrintWriter(baseFilename + '.html');
                    out.print(self.driver.getPageSource());
                    out.close();
                } catch (x) {
                    self.output('html capture error');
                    self.output(x.message, self.output.status.warning);
                }

                self.output('�L���v�`��:' + baseFilename);

                return null;
            }
        }
        ,selectByValue : {
            comment : 'select�l�I��'
            ,argList : ['�v�f', '�l']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '�́u'
                        + testData.command[2]
                        + '�v��I������B';
                }
                var
                selectElement = self.getElement(testData.command[1])
                ;

                try {
                    selectElement = selectElement
                        .findElementByXPath('descendant-or-self::select');
                } catch (x) {
                    throw new Error(testData.command[1]
                                    + '�ɂ�select�͂���܂���B');
                }

                new Select(selectElement).selectByValue(testData.command[2]);

                return null;
            }
        }
        ,input : {
            comment : '�l����'
            ,argList : ['�v�f', '�l']
            ,func : function (testData) {
                var
                keyData
                ,element
                ;
                if (!testData.command[2]) {
                    throw new Error('�����Q������܂���B');
                }
                if (testData.command[2].lastIndexOf('Keys.', 0) == 0) {
                    // �L�[�w��
                    keyData = eval(testData.command[2]);
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + '�Ɂu'
                            + testData.command[2].split('.', 2)[1]
                            + '�L�[�v����͂���B';
                    }
                }
                else {
                    // ������w��
                    keyData = testData.command[2];
                    if (self.isMakeDoc) {
                        return self.makeReadableElement(testData.command[1])
                            + '�Ɂu'
                            + keyData
                            + '�v����͂���B';
                    }
                }
        

                element = self.getElement(testData.command[1]);

                element.sendKeys(keyData);

                return null;
            }
        }
        ,clear : {
            comment : '�l�N���A'
            ,argList : ['�v�f']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '���N���A����B';
                }
                var
                element = self.getElement(testData.command[1])
                ;

                element.clear();

                return null;
            }
        }
        ,getSelected : {
            comment : '�I�������l�̎擾'
            ,argList : ['�v�f', '�l']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '���u'
                        + testData.command[2]
                        + '�v��I�����Ă��邱�ƁB';
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
                    // select�����݂���ꍇ
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
                    // select�ȊO
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
            comment : '�q�v�f���`�F�b�N'
            ,argList : ['�v�f', '�q�v�f��']
            ,func : function (testData) {
                if (self.isMakeDoc) {
                    return self.makeReadableElement(testData.command[1])
                        + '�̎q�v�f��'
                        + testData.command[2]
                        + '�ł��邱�ƁB';
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
            comment : '�g���R�}���h'
            ,argList : ['�t�@�C����', '����1', '����2']
            ,func : function (testData) {
                if (!self.customFunction[testData.command[1]]) {
                    // ����`�̏ꍇ�͓ǂݍ���
                    self.customFunction[testData.command[1]]
                        = eval(readFile(self.initialize.baseDir
                                        + testData.command[1]));
                }

                // ���s
                return self.customFunction[testData.command[1]](testData);
            }
        }
    };
};
WebTest.prototype = new UnitTest();
