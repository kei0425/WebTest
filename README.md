WebTest
=======

ブラウザの自動テスト

Excelで記述したテスト項目をSelenium2.0を利用して自動的にテストします。
スタンドアロン(ブラウザFireFox固定)とScelenium Gridに対応したマルチブラウザに対応しています。

### 必要なもの

* Excel (2003)
* Selenium-2.25.0(Selenium Client Drivers for Java(スタンドアロン), Selenium Server(マルチブラウザ))
* Java (1.6)
* Rhino (1.7 R4)

### 設定

1. 環境変数の設定
  seleniumとrhinoをダウンロードし、それぞれのjarファイルを配置したフォルダを環境変数(SELENIUM_HOME,RHINO_HOME)に設定します。

