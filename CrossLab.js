customCommand = {
    getGridSelectedVar : {
        comment : 'グリッドで選択している変数名を取得する'
        ,argList : ['グリッド要素', '選択変数名（,区切）']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + 'が「'
                        + testData.command[2]
                        + '」を選択していること。';
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
        comment : 'フォーカスを設定し、クリア確認後、指定文字列を入力する'
        ,argList : ['要素', '値']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + 'にフォーカスを設定後、「'
                        + testData.command[2]
                        + '」を入力する。';
            }

            var
            element = self.getElement(testData.command[1]);

            // いったんフォーカス移動
            element.sendKeys('');

            // クリア確認
            self.waitAssert(
                ''
                ,function () {
                    // フォーカス移動
                    element.sendKeys('');

                    return element.getAttribute('value');
                }
            );

            // キー入力
            element.sendKeys(testData.command[2]);

            return null;
        }
    }
    ,BSClear : {
        comment : '「要素」をバックスペースでクリアする'
        ,argList : ['要素']
        ,func : function (testData) {
            if (self.isMakeDoc) {
                return self.makeReadableElement(testData.command[1])
                        + 'の入力をバックスペースでクリアする。';
            }

            var
            element = self.getElement(testData.command[1])
            ;

            // クリア
            while (element.getAttribute('value') != '') {
                element.sendKeys(Keys.BACK_SPACE);
            }

            return null;
        }
    }
};
