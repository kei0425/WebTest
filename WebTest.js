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
    this.timeout = params.timeout || 2;
    /**
     * �h���C�o�[
     */
    this.driver = params.driver || new FirefoxDriver();
    /**
     * �x�[�XURL
     */
    this.baseUrl = params.baseUrl;
    /**
     * �L���v�`��
     */
    this.isCapture = params.capture || false;
    /**
     * wait
     */
    this.wait = new WebDriverWait(this.driver, this.timeout);

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
                element.element = this.wait.until(
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

    // �R�}���h�ꗗ
    this.open = function (testData) {
        this.driver.get(this.baseUrl + testData.command[1]);
    };
    this.click = function (testData) {
        this.getElement(testData.command[1]).click();
    };
    this.quit = function (testData) {
        this.driver.quit();
    };
    this.isEnabled = function (testData) {
        var
        element = this.getElement(testData.command[1])
        ,isEnabled = function () {
            return element.isEnabled() && element.isDisplayed();  
        };
        try {
            this.wait.until(
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
    };
    this.alert = function (testData) {
        // �A���[�g���ł�܂ő҂�
        var alert;
        try {
            alert = this.wait.until(ExpectedConditions.alertIsPresent());
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
    };
    this.getText = function (testData) {
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
            this.wait.until(
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
    };
    this.dragAndDrop = function (testData) {
        var
        element1 = this.getElement(testData.command[1])
        ,element2 = this.getElement(testData.command[2]);

        new Actions(this.driver).clickAndHold(element1)
            .moveToElement(element2).release(element2).build().perform();
    };
    this.capture = function (testData, testName, no) {
        var
        baseFilename = this.initialize.baseDir + testName + no
        ,out
        ,tmpfile
        ;

        try {
            // �A���[�g�_�C�A���O�o�����͂Ƃ�Ȃ�
            this.driver.switchTo().alert();
            return;
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
    };
    this.selectByValue = function (testData) {
        var
        selectElement = this.getElement(testData.command[1])
        ;

        if (selectElement.getTagName() != 'select') {
            throw new Error(testData.command[1] + '��select�ł͂���܂���B');
        }

        new Select(selectElement).selectByValue(testData.command[2]);
    };
    this.input = function (testData) {
        var
        element = this.getElement(testData.command[1])
        ;

        element.sendKeys(testData.command[1]);
    };
};
WebTest.prototype = new UnitTest();
