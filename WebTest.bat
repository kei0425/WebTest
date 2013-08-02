@echo off

if "%1" == "DEBUG" goto DEBUG
if "%1" == "" goto NONE
java -cp "%RHINO_HOME%/js.jar;%SELENIUM_HOME%/selenium-java-2.28.0.jar;%SELENIUM_HOME%/libs/*" org.mozilla.javascript.tools.shell.Main %~dp0\load.js %~dp0\WebTestMain.js %*
goto :EOF

:NONE
java -cp "%RHINO_HOME%/js.jar;%SELENIUM_HOME%/selenium-java-2.28.0.jar;%SELENIUM_HOME%/libs/*" org.mozilla.javascript.tools.shell.Main -f %~dp0\load.js -f %~dp0\loader.js -f -
goto :EOF

:DEBUG
java -cp "%RHINO_HOME%/js.jar;%SELENIUM_HOME%/selenium-java-2.28.0.jar;%SELENIUM_HOME%/libs/*" org.mozilla.javascript.tools.debugger.Main -f %~dp0\load.js -f %~dp0\loader.js -f -
