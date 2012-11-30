load("UnitTest.js");
importPackage(org.openqa.selenium);
importPackage(org.openqa.selenium.firefox);
importPackage(org.openqa.selenium.support.ui);
importPackage(org.openqa.selenium.interactions);

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

    // �e�X�g�ǂݍ���
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

        // �e�X�g���X�g�̍쐬
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
            self.output('�區��:setUp');
            makeDocMain('setUp');
        }
        if (this.testPattern['tearDown']) {
            self.output('�區��:tearDown');
            makeDocMain('tearDown');
        }

        for (i = 0; i < testList.length; i++) {
            testName = testList[i];
            self.output('�區��:' + testName);
            makeDocMain(testName);
        }
        
        this.isMakeDoc = false;
    };

    // �G�������g�擾
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
                // XPath�w��
                by = By.ByXPath(xpath + element.by.ByXPath);
                xpath = xpath + element.by.ByXPath;
            }
            else if (element.by.ById) {
                // ID�w��
                by = By.ById(element.by.ById);
            }
            else if (element.by.ByLinkText) {
                // ���̑�
                by = By.ByLinkText(element.by.ByLinkText);
            }
            // ������܂ő҂�
            try {
                element.element = 
                    new WebDriverWait(this.driver, this.timeout).until(
                        ExpectedConditions.presenceOfElementLocated(by));
            } catch (x) {
                throw new Error("�v�f���݂���܂���:" + path
                                + '(' + x.message + ')');
            }

            if (element.by.ById) {
                xpath = xpath + '//' + element.element.getTagName()
                    + "[@id='" + element.by.ById + "']";
            }

        }

        // �G�������g��Ԃ�
        return element.element;
    };
    // �e�X�g���s
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
                    // �R�}���h���s
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
                throw new Error('���f���܂��B');
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

    // �R�}���h�ꗗ
    this.open = function (testData) {
        if (this.isMakeDoc) {
            return '�x�[�X�A�h���X+�u' + testData.command[1] + '�v���J���B';
        }

        this.driver.get(this.baseUrl + testData.command[1]);
        
        return null;
    };
    this.click = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + '���N���b�N����B';
        }
        this.getElement(testData.command[1]).click();

        return null;
    };
    this.quit = function (testData) {
        if (this.isMakeDoc) {
            return '�u���E�U���I������B';
        }

        this.driver.quit();

        return null;
    };
    this.isEnabled = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1]) + '��'
                + (testData.command[2] ? '�L��' : '����') + '�ł��邱�ƁB';
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
            return '�A���[�g�_�C�A���O�u' + testData.command[1]
                + '�v���o�����邱�ƁB�i���̌�u'
                + ( testData.command[2] ? 'OK' : '�L�����Z��')
                + '�v���N���b�N�j';
        }

        // �A���[�g���ł�܂ő҂�
        var alert;
        try {
            alert = new WebDriverWait(this.driver, this.timeout).until(
                ExpectedConditions.alertIsPresent());
        } catch (x) {
            throw new Error('�_�C�A���O���o�����܂���B');
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
                    + '�ɂȂɂ��\������Ă��Ȃ����ƁB';
            }
            else {
                return this.makeReadableElement(testData.command[1])
                    + '�Ɂu' + testData.command[2] + '�v���\������Ă��邱�ƁB';
            }
        }
        var
        element = this.getElement(testData.command[1])
        ,getText = function () {
            if (element.getTagName() == 'input') {
                // input�^�O�̏ꍇ
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
                + '����'
                + this.makeReadableElement(testData.command[2])
                + '�Ƀh���b�O�A���h�h���b�v����B';
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
            return '��ʃL���v�`���B';
        }
        var
        baseFilename = this.initialize.baseDir + testName + no
        ,out
        ,tmpfile
        ;

        try {
            // �A���[�g�_�C�A���O�o�����͂Ƃ�Ȃ�
            this.driver.switchTo().alert();
            return null;
        } catch (x) {

        }

        // ��ʃL���v�`��
        try {
            new java.io.File(baseFilename + '.png').delete();
            tmpfile = this.driver.getScreenshotAs(OutputType.FILE);
            new java.io.File(tmpfile).renameTo(
                new java.io.File(baseFilename + '.png'));
        } catch (x) {
            this.output('png capture');
            this.output(x.message, this.output.status.warning);
        }
        
        // HTML�o��
        try {
            out = new java.io.PrintWriter(baseFilename + '.html');
            out.print(this.driver.getPageSource());
            out.close();
        } catch (x) {
            this.output('html capture');
            this.output(x.message, this.output.status.warning);
        }

        this.output('�L���v�`��:' + baseFilename);

        return null;
    };
    this.selectByValue = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + '�́u'
                + testData.command[2]
                + '�v��I������B';
        }
        var
        selectElement = this.getElement(testData.command[1])
        ;

        if (selectElement.getTagName() != 'select') {
            throw new Error(testData.command[1] + '��select�ł͂���܂���B');
        }

        new Select(selectElement).selectByValue(testData.command[2]);

        return null;
    };
    this.input = function (testData) {
        if (this.isMakeDoc) {
            return this.makeReadableElement(testData.command[1])
                + '�Ɂu'
                + testData.command[2]
                + '�v����͂���B';
        }
        var
        element = this.getElement(testData.command[1])
        ;

        element.sendKeys(testData.command[1]);

        return null;
    };
};
WebTest.prototype = new UnitTest();
