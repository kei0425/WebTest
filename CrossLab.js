customCommand = {
    getGridSelectedVar : {
        comment : '�O���b�h�őI�����Ă���ϐ������擾����'
        ,argList : ['�O���b�h�v�f', '�I��ϐ����i,��؁j']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + '���u'
                        + testData.command[2]
                        + '�v��I�����Ă��邱�ƁB';
            }

            var
            gridNode = self.getElement(testData.command[1])
            ,xpath ="descendant-or-self::tr[contains(@class, 'rowselected')]/td[1]" 
            ;

            self.waitAssert(
                testData.command[2]
                ,function () {
                    return convertJavaArrayToJsArray(
                        gridNode.findElements(
                            By.ByXPath(xpath))
                    ).map(
                        function (node) {
                            return node.getText().split(': ')[0];
                        }
                    ).join(',');
                }
            );

            return null;
        }
    }
    ,focusInput : {
        comment : '�t�H�[�J�X��ݒ肵�A�N���A�m�F��A�w�蕶�������͂���'
        ,argList : ['�v�f', '�l']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + '�Ƀt�H�[�J�X��ݒ��A�u'
                        + testData.command[2]
                        + '�v����͂���B';
            }

            var
            element = self.getElement(testData.command[1]);

            // ��������t�H�[�J�X�ړ�
            element.sendKeys('');

            // �N���A�m�F
            self.waitAssert(
                ''
                ,function () {
                    // �t�H�[�J�X�ړ�
                    element.sendKeys('');

                    return element.getAttribute('value');
                }
            );

            // �L�[����
            element.sendKeys(testData.command[2]);

            return null;
        }
    }
    ,BSClear : {
        comment : '�u�v�f�v���o�b�N�X�y�[�X�ŃN���A����'
        ,argList : ['�v�f']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + '�̓��͂��o�b�N�X�y�[�X�ŃN���A����B';
            }

            var
            element = self.getElement(testData.command[1])
            ;

            // �N���A
            while (element.getAttribute('value') != '') {
                element.sendKeys(Keys.BACK_SPACE);
            }

            return null;
        }
    }
};
