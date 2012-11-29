@echo off
if "%1" == "" goto NONE
java -cp "%RHINO_HOME%/js.jar;%SELENIUM_HOME%/selenium-java-2.25.0.jar;%SELENIUM_HOME%/libs/*" org.mozilla.javascript.tools.shell.Main %~dp0\load.js %~dp0\WebTestMain.js %*
goto :EOF

:NONE
java -cp "%RHINO_HOME%/js.jar;%SELENIUM_HOME%/selenium-java-2.25.0.jar;%SELENIUM_HOME%/libs/*" org.mozilla.javascript.tools.shell.Main

