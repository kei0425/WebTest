/**
 * �e�X�g�N���X
 */
var UnitTest = function () {
    /**
     * �o��
     */
    this.output = function (message) {
        print(message);
    };
    this.output.status = {
        "normal"  : 0,
        "warning" : 1
    };
    /**
     * �A�T�[�g
     */
    this.assert = function (message, expr) {
        if (!expr) {
            throw new Error(message);
        }
        this.assertCount++;
    
        return true;
    };
    /**
     * �A�T�[�g�C�R�[��
     */
    this.assertEquals = function () {
        var
        message,
        expect,
        result
        ;
        if (arguments.length == 2) {
            message = '';
            expect = arguments[0];
            result = arguments[1];
        }
        else {
            message = arguments[0];
            expect = arguments[1];
            result = arguments[2];
        }
        return this.assert(message + "\nexpect : " + expect
                           + "\nresult : " + result,
                           expect == result);
    };
    /**
     * �e�X�g���s
     */
    this.runner = function () {
        this.assertCount = 0;
        var
        successful = 0
        ,self = this
        ,hasSetup = typeof this.setUp == "function"
        ,hasTeardown = typeof this.tearDown == "function"
        ,testList = []
        ,testCount
        ,testNum
        ,testName
        ,i
        ,testExec
        ;

        // �e�X�g���X�g�̍쐬
        for (testName in this) {
            if (/^\d/.test(testName)) {
                testList.push(testName);
            }
        }
        testCount = testList.length;

        testList.sort(function (a,b) {
                          var
                          num_a = a.match(/^\d+/),
                          num_b = b.match(/^\d+/)
                          ;

                          return num_b - num_a;
                      });

        // ���s
        testNum = 0;
        testExec = function (testName) {
            testNum++;
            try {
                self[testName]();
                self.output('ok ' + testNum + ' - ' + testName,
                            self.output.status.normal);
                successful++;
                return true;
            } catch (e) {
                self.output('not ok ' + testNum + ' - ' + testName + e.message,
                            self.output.status.warning);
                return false;
            }
        };
        for (i = 0; i < testCount; i++) {
            testName = testList[i];

            if (hasSetup) {
                if (!testExec('setUp')) {
                    break;
                }
            }

            if (!testExec(testName)) {
                break;
            }

            if (hasTeardown) {
                if (!testExec('tearDown')) {
                    break;
                }
            }
        }
        
        print ('1..' + testNum );
    };
};

// ���܂�
function $fn(target) {
    var fn = [];
    for (var key in target) {
        if (typeof (target[key]) == "function") {
            fn.push(key);
        }
    }
    return fn.sort();
}
