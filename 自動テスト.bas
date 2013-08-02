Attribute VB_Name = "自動テスト"
Private testStartIndex As Integer
Private browserName As String
Private testHeader As Json
Private testTable As Json
Private testSheet As Worksheet
Private testCount As Integer

Sub チェック_Click()
    Dim cb As CheckBox
    Set cb = ActiveSheet.CheckBoxes(Application.Caller)
    Dim cbRange As Range
    Set cbRange = CheckBoxToRange(cb)
    
    If cb.value = 1 Then
        cbRange.value = True
    Else
        cbRange.value = False
    End If
End Sub

Function CheckBoxToRange(cb As CheckBox) As Range
    Dim cbRange As Range
    Set cbRange = Range(cb.TopLeftCell, cb.BottomRightCell)
    Set CheckBoxToRange = cbRange(1 + (cbRange.Rows.count - 1) / 2, 1 + (cbRange.Columns.count - 1) / 2)
End Function

Function RangeToCheckBox(cbRange As Range) As CheckBox
    Dim cb As CheckBox
    Dim rRange As Range
    
    For Each cb In cbRange.Worksheet.CheckBoxes
        Set rRange = CheckBoxToRange(cb)
        If rRange.Row = cbRange.Row And rRange.Column = cbRange.Column Then
            Set RangeToCheckBox = cb
            Exit Function
        End If
    Next

    Set RangeToCheckBox = Nothing
End Function


Sub ファイル取り込み(testfile As String, Optional saveName As String = "")
    ' ファイル読込
    Dim testJson As New Json
    testJson.LoadFile testfile, "SJIS"
    
    Dim ws As Worksheet
    Dim setting As Json
    
    ' ブラウザ設定
    If testJson("initialize").ContainsKey("browserlist") Then
        Set ws = Worksheets("ブラウザ設定")
        Set setting = ヘッダ取得(ws)
        クリアシート ws
        
        Dim name As Variant
        Dim rowIndex As Integer
        rowIndex = 2
        
        For Each name In testJson("initialize")("browserlist").keys
            ws.Cells(rowIndex, setting("ラベル")).value = name
            Dim browser As Json
            Set browser = testJson("initialize")("browserlist")(name)
            If browser.ContainsKey("remote") Then
                If browser("remote") Then
                    ws.Cells(rowIndex, setting("remote")).value = True
                    browser.RemoveKey "remote"
                Else
                    ws.Cells(rowIndex, setting("remote")).value = ""
                End If
            Else
                ws.Cells(rowIndex, setting("remote")).value = ""
            End If
            
            ws.Cells(rowIndex, setting("browserName")).value = browser("browserName")
            browser.RemoveKey "browserName"
            If browser.ContainsKey("version") Then
                ws.Cells(rowIndex, setting("version")).value = browser("version")
                browser.RemoveKey "version"
            Else
                ws.Cells(rowIndex, setting("version")).value = ""
            End If
            If browser.ContainsKey("platform") Then
                ws.Cells(rowIndex, setting("platform")).value = browser("platform")
                browser.RemoveKey "platform"
            Else
                ws.Cells(rowIndex, setting("platform")).value = ""
            End If
            
            browser.RemoveKey "rowIndex"
            
            ' 残りを表示
            If browser.count > 0 Then
                Dim other As String
                other = ""
                Dim otherKey
                
                For Each otherKey In browser.keys
                    other = other & ", " & otherKey & " : " & browser(otherKey)
                Next
                other = Mid(other, 3)
                ws.Cells(rowIndex, setting("その他")).value = other
            Else
                ws.Cells(rowIndex, setting("その他")).value = ""
            End If
            
            rowIndex = rowIndex + 1
        Next
    End If
    
    ' 設定シート
    Set ws = Worksheets("設定")
    Set setting = シート取り込み縦(ws)
    
    ws.Cells(setting("行index")("baseURL"), 2).value = testJson("initialize")("baseUrl")
    If testJson("initialize").ContainsKey("customcommand") Then
        ws.Cells(setting("行index")("カスタムコマンド"), 2).value = testJson("initialize")("customcommand")
    Else
        ws.Cells(setting("行index")("カスタムコマンド"), 2).value = ""
    End If
    
    If testJson("initialize").ContainsKey("testbrowser") Then
        Dim cb As CheckBox
        For Each name In testJson("initialize")("testbrowser").Items
            Set cb = RangeToCheckBox(ws.Cells(setting("行index")(name), 2))
            ws.Cells(setting("行index")(name), 2).value = True
            cb.value = 1
        Next
    End If
    
    If saveName <> "" Then
        ' 外部起動の場合はファイル名をクリア
        Dim filename As String
        filename = Dir(testfile)
        ws.Cells(setting("行index")("baseDir"), 2).value = Replace(testfile, filename, "")
        ws.Cells(setting("行index")("ファイル名"), 2).value = filename
    End If
    
    ' 画面構成要素
    Set ws = Worksheets("画面構成要素")
    Set setting = ヘッダ取得(ws)
    
    ' 行削除
    ws.Range("2:" & ws.UsedRange.Rows.count).Delete
    
    Dim element As Json
    
    Dim gamen, youso1, youso2, youso3
    Dim gamenJson As Json
    Dim youso1Json As Json
    Dim youso2Json As Json
    Dim youso3Json As Json
    
    Dim arr() As Variant
    
    rowIndex = 2
    For Each gamen In testJson("initialize")("elements").keys
        ws.Cells(rowIndex, setting("画面")).value = gamen
        Set gamenJson = testJson("initialize")("elements")(gamen)
        For Each youso1 In gamenJson.keys
            Set youso1Json = gamenJson(youso1)
            ws.Cells(rowIndex, setting("要素名1")).value = youso1
            arr = youso1Json("by").keys
            ws.Cells(rowIndex, setting("検索方法")).value = arr(0)
            arr = youso1Json("by").Items
            ws.Cells(rowIndex, setting("パターン")).value = arr(0)
            youso1Json.RemoveKey ("by")
            rowIndex = rowIndex + 1
            
            For Each youso2 In youso1Json.keys
                Set youso2Json = youso1Json(youso2)
                ws.Cells(rowIndex, setting("要素名2")).value = youso2
                arr = youso2Json("by").keys
                ws.Cells(rowIndex, setting("検索方法")).value = arr(0)
                arr = youso2Json("by").Items
                ws.Cells(rowIndex, setting("パターン")).value = arr(0)
                youso2Json.RemoveKey ("by")
                rowIndex = rowIndex + 1
                For Each youso3 In youso2Json.keys
                    Set youso3Json = youso2Json(youso3)
                    ws.Cells(rowIndex, setting("要素名3")).value = youso3
                    arr = youso3Json("by").keys
                    ws.Cells(rowIndex, setting("検索方法")).value = arr(0)
                    arr = youso3Json("by").Items
                    ws.Cells(rowIndex, setting("パターン")).value = arr
                    rowIndex = rowIndex + 1
                Next
            Next
        Next
    Next
    
    ' テストシート
    Dim testSheetsJson As Json
    Set testSheetsJson = テストシート取得
    
    ' 既存テストシート削除
    Dim i As Integer
    Application.DisplayAlerts = False
    For i = 0 To testSheetsJson.count - 1
        testSheetsJson(i).Delete
    Next
    Application.DisplayAlerts = True
    
    Set ws = Worksheets("テストテンプレート")
    Set setting = ヘッダ取得(ws)
    
    Dim testName
    For Each testName In testJson("test").keys
        Dim testSheetJson As Json
        Set testSheetJson = testJson("test")(testName)
        
        rowIndex = 2
        Dim sheetnameSplit
        If testName = "tearDown" Then
            sheetnameSplit = Split("0 終了設定", " ", 2)
            Set ws = Worksheets("0 テスト-初期設定 終了処理")
            rowIndex = ws.UsedRange.Rows.count + 1
        Else
            ' シートコピー
            Worksheets("テストテンプレート").Copy After:=ws
            Set ws = ActiveSheet
            If testName = "setUp" Then
                sheetnameSplit = Split("0 初期設定", " ", 2)
                ws.name = "0 テスト-初期設定 終了処理"
            Else
                sheetnameSplit = Split(testName, " ", 2)
                ws.name = sheetnameSplit(0) & " テスト-" & sheetnameSplit(1)
            End If
        End If
        
        ws.Cells(rowIndex, setting("大項目")).value = sheetnameSplit(1)
        rowIndex = rowIndex + 1
        
        For i = 0 To testSheetJson.count - 1
            Dim testRow As Json
            Set testRow = testSheetJson(i)
            If testRow.ContainsKey("caption") Then
                ws.Cells(rowIndex, setting("中項目")).value = testRow("caption")
            Else
                ws.Cells(rowIndex, setting("中項目")).value = ""
            End If
            
            ws.Cells(rowIndex, setting("項目名")).value = testRow("comment")
            
            If testRow.ContainsKey("retry_point") Then
                ws.Cells(rowIndex, setting("再実行")).value = "○"
            Else
                ws.Cells(rowIndex, setting("再実行")).value = ""
            End If
            
            If testRow.ContainsKey("error_continue") Then
                ws.Cells(rowIndex, setting("続行")).value = "○"
            Else
                ws.Cells(rowIndex, setting("続行")).value = ""
            End If
            
            ws.Cells(rowIndex, setting("コマンド")).value = testRow("command")(0)
            
            Dim paramindex As Integer
            For paramindex = 1 To testRow("command").count - 1
                ws.Cells(rowIndex, setting("引数" & paramindex)).value = testRow("command")(paramindex)
            Next
            
            rowIndex = rowIndex + 1
        Next
    Next
    
    If saveName <> "" Then
        Dim orgName As String
        orgName = ThisWorkbook.FullName
        Application.DisplayAlerts = False
        ThisWorkbook.SaveAs filename:=saveName
        ThisWorkbook.SaveAs filename:=orgName
        Application.DisplayAlerts = True
    End If
    
End Sub

Sub テストファイル作成実行()
    ' 値の設定
    Dim setting As Json
    Set setting = シート取り込み縦(Worksheets("設定"))
    
    テストファイル作成 setting
    
    ' コマンド実行
    テスト実行 setting
    
    サマリ
End Sub

Sub テストファイル作成ドキュメント作成()
    ' 値の設定
    Dim setting As Json
    Set setting = シート取り込み縦(Worksheets("設定"))
    
    テストファイル作成 setting
    
    ' コマンド実行
    質問文作成実行 setting
End Sub

Sub コマンドリスト取得()
    ' 値の設定
    Dim setting As Json
    Set setting = シート取り込み縦(Worksheets("設定"))
    
    テストファイル作成 setting
    
    クリアシート Worksheets("コマンド")
    
    Dim command As String
    command = setting("コマンド") & " " & setting("コマンドリスト取得オプション") & " " & setting("baseDir") & setting("ファイル名")
   
    実行 command, "コマンド"
End Sub

Sub クリア()
    クリアシート Worksheets("ログ")
    クリアシート Worksheets("サマリ")
    
    Dim testList As Json
    Set testList = テストシート取得
    
    Dim ws
    For Each ws In testList.Items
        クリアシート ws, "実行日付", "結果"
    Next
End Sub

Sub クリアシート(ws, ParamArray deleteColumn())
    ' ヘッダ取得
    Dim header As Json
    Set header = ヘッダ取得(ws)
    
    Dim rowIndex As Integer
    rowIndex = header("HeaderRow")
    
    ' 残すものをテーブルに登録
    Dim deleteTable As New Dictionary
    Dim deleteKey
    For Each deleteKey In deleteColumn
        deleteTable.Add deleteKey, deleteKey
    Next
    
    ' 行ごとにチェック
    Dim key
    Dim isData As Boolean
    isData = True
    Do While isData
        rowIndex = rowIndex + 1
        isData = False
        For Each key In header.keys
            If key <> "HeaderRow" And Not IsEmpty(ws.Cells(rowIndex, header(key)).value) Then
                isData = True
                If UBound(deleteColumn) = -1 Or deleteTable.Exists(key) Then
                    ws.Cells(rowIndex, header(key)).value = ""
                End If
            End If
        Next
    Loop
End Sub


Sub サマリ()
    ' サマリ
    Dim summarySheet As Worksheet
    Set summarySheet = Worksheets("サマリ")
    
    Dim summaryHeader As Json
    Set summaryHeader = ヘッダ取得(summarySheet, "実行日付")
    
    ' 空き検索
    Dim rowIndex As Integer
    rowIndex = summarySheet.Cells(Rows.count, 1).End(xlUp).Row
    
    ' シートチェック
    Dim testSheets As Json
    Set testSheets = テストシート取得
    
    Dim resultJson As Json
    Dim testSheet As Worksheet
    Dim item
    For Each item In testSheets.Items
        Set testSheet = item
        If testSheet.name <> "0 テスト-初期設定 終了処理" Then
            Dim testJson As Json
            Set testJson = シート取り込み(testSheet)
            Dim dataRow
            For Each dataRow In testJson("data").Items
                If dataRow.ContainsKey("大項目") Then
                    rowIndex = rowIndex + 1
                    summarySheet.Cells(rowIndex, summaryHeader("大項目")) = dataRow("大項目")
                    summarySheet.Cells(rowIndex, summaryHeader("項目数")) = 0
                    Set resultJson = New Json
                End If
                If dataRow.ContainsKey("実行日付") Then
                    summarySheet.Cells(rowIndex, summaryHeader("実行日付")) = dataRow("実行日付")
                    summarySheet.Cells(rowIndex, summaryHeader("項目数")) = summarySheet.Cells(rowIndex, summaryHeader("項目数")) + 1
                End If
                If dataRow.ContainsKey("結果") Then
                    Dim result
                    For Each result In Split(dataRow("結果"), vbLf)
                        Dim b
                        b = Split(result, ":")
                        If Not resultJson.ContainsKey(b(0)) Then
                            resultJson(b(0)) = New Json
                            resultJson(b(0))("○") = 0
                            resultJson(b(0))("×") = 0
                        End If
                        resultJson(b(0))(b(1)) = resultJson(b(0))(b(1)) + 1
                    Next
                    
                    Dim browser
                    Dim outSuccess As Json
                    Dim outFail As Json
                    Set outSuccess = New Json
                    Set outFail = New Json
                    
                    For Each browser In resultJson.keys
                        outSuccess.Push browser & ":" & resultJson(browser)("○")
                        outFail.Push browser & ":" & resultJson(browser)("×")
                    Next
                    summarySheet.Cells(rowIndex, summaryHeader("正常")) = join(outSuccess.Items, vbLf)
                    summarySheet.Cells(rowIndex, summaryHeader("失敗")) = join(outFail.Items, vbLf)
                End If
            Next
        End If
    Next
End Sub

Sub 名前付テストファイル作成(filename As String)
    テストファイル作成 Nothing, filename
End Sub

Function テストファイル作成(setting As Json, Optional filename As String = "") As Json
    ' 値の設定
    If setting Is Nothing Then
        Set setting = シート取り込み縦(Worksheets("設定"))
    Else
        ログ出力 "テストファイル作成"
    End If
    
    Dim settingFile As New Json
    
    ' 初期設定
    settingFile("initialize") = New Json
    settingFile("initialize")("baseUrl") = setting("baseURL")
    settingFile("initialize")("baseDir") = setting("baseDir")
    
    settingFile("initialize")("browserlist") = ブラウザ設定(Worksheets("ブラウザ設定"))
    settingFile("initialize")("testbrowser") = テストブラウザ設定(setting, settingFile)
    settingFile("initialize")("elements") = 要素設定(Worksheets("画面構成要素"))
    
    If setting.ContainsKey("カスタムコマンド") Then
        If setting("カスタムコマンド") <> "" Then
            settingFile("initialize")("customcommand") = setting("カスタムコマンド")
        End If
    End If
    
    
    settingFile("test") = テストパターン設定
    
    If filename = "" Then
        filename = setting("baseDir") & setting("ファイル名")
    End If
        
    settingFile.SaveFile (filename)
    
    Set テストファイル作成 = settingFile
End Function

Function 要素設定(settingSheet As Worksheet) As Json
    Dim elements As New Json
    
    Dim rowIndex As Integer, columnIndex As Integer
    Dim headerTable As Json
    Set headerTable = ヘッダ取得(settingSheet, "画面")
    
    Dim lastElement() As Json
    ReDim lastElement(headerTable("検索方法") - headerTable("要素名1"))
    Set lastElement(1) = elements
    
    rowIndex = headerTable("HeaderRow") + 1
    Dim newElement As Json
    Dim byList As Json
    
    Do While settingSheet.Cells(rowIndex, headerTable("検索方法")).value <> ""
        If settingSheet.Cells(rowIndex, 1).value <> "" Then
            ' 画面名あり
            Set lastElement(1) = New Json
            elements(settingSheet.Cells(rowIndex, 1).value) = lastElement(1)
        End If
        
        columnIndex = headerTable("要素名1")
        Do While settingSheet.Cells(rowIndex, columnIndex).value = "" And columnIndex < headerTable("検索方法")
            columnIndex = columnIndex + 1
        Loop
        
        If columnIndex >= headerTable("検索方法") Then
            MsgBox "要素名が設定されていません"
            Exit Function
        End If
        
        Set newElement = New Json
        Dim elementIndex As Integer
        elementIndex = columnIndex - 1

        lastElement(elementIndex)(settingSheet.Cells(rowIndex, columnIndex).value) = newElement
        Set byList = New Json
        newElement("by") = byList
        byList(settingSheet.Cells(rowIndex, headerTable("検索方法")).value) = settingSheet.Cells(rowIndex, headerTable("パターン")).value
        
        If elementIndex + 1 <= UBound(lastElement) Then
            Set lastElement(elementIndex + 1) = newElement
        End If
        rowIndex = rowIndex + 1
    Loop

    Set 要素設定 = elements
End Function

' ヘッダ取得
Function ヘッダ取得(ws, Optional headColumn As String) As Json
    Dim columnTable As New Json
    Dim headCell As Range
    If headColumn <> "" Then
        Set headCell = ws.Range("A1:E5").Find(What:=headColumn)
    End If
    If headCell Is Nothing Then
        Set headCell = ws.Range("A1")
        If headCell.value = "" Then
            Set headCell = headCell.End(xlDown)
        End If
    End If
    
    Dim rowIndex As Integer
    Dim columnIndex As Integer
    rowIndex = headCell.Row
    columnIndex = headCell.Column
    
    Do While ws.Cells(rowIndex, columnIndex).value <> ""
        columnTable(ws.Cells(rowIndex, columnIndex).value) = columnIndex
        columnIndex = columnIndex + 1
    Loop
    
    ' ヘッダの行も入れておく
    columnTable("HeaderRow") = rowIndex
    
    Set ヘッダ取得 = columnTable
End Function

' シート取り込み
Function シート取り込み(ws As Worksheet, Optional headColumn As String) As Json
    ' 配列取り込み
    Dim sheetData
    sheetData = ws.UsedRange.value
    
    Dim rowStart As Integer
    Dim columnStart As Integer
    rowStart = 1
    columnStart = 1
    
    If headColumn <> "" Then
        Do While sheetData(rowStart, columnStart) <> headColumn
            columnStart = columnStart + 1
            If UBound(sheetData, 2) < columnStart Then
                rowStart = rowStart + 1
                columnStart = 1
                If UBound(sheetData, 1) < rowStart Then
                    Err.Raise 514, "フォーマットエラー", headColumn & "がみつかりません。"
                End If
            End If
        Loop
    End If
    
    Dim rowIndex As Integer
    Dim columnIndex As Integer
    
    Dim header As New Json
    columnIndex = columnStart
    rowIndex = rowStart
    Do While columnIndex <= UBound(sheetData, 2)
        header(sheetData(rowIndex, columnIndex)) = columnIndex
        columnIndex = columnIndex + 1
    Loop
    
    ' シート取り込み
    Dim sheet As New Json
    sheet("Header") = header
    Dim data As New Json
    sheet("data") = data
    Dim rowData As Json
    Dim key
    Dim item As String
    
    Do While True
        rowIndex = rowIndex + 1
        If UBound(sheetData, 1) < rowIndex Then
            Exit Do
        End If
        Set rowData = New Json
        For Each key In header.keys
            If Not IsEmpty(sheetData(rowIndex, header(key))) Then
                rowData(key) = sheetData(rowIndex, header(key))
            End If
        Next
                
        rowData("rowIndex") = rowIndex
        data.Push rowData
    Loop
    
    Set シート取り込み = sheet
End Function

' シート取り込み
Function シート取り込み縦(ws As Worksheet) As Json
    ' 配列取り込み
    Dim sheetData
    sheetData = ws.UsedRange.value
    
    Dim rowIndex As Integer
    rowIndex = 1
    
    Dim sheet As New Json
    Set sheet("行index") = New Json
    
    Do While rowIndex <= UBound(sheetData, 1)
        sheet("行index")(sheetData(rowIndex, 1)) = rowIndex
        sheet(sheetData(rowIndex, 1)) = sheetData(rowIndex, 2)
        rowIndex = rowIndex + 1
    Loop
    
    Set シート取り込み縦 = sheet
End Function

Function テストシート取得() As Json
    Dim testList As New Json
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    regExp.Pattern = "^([0-9]+) テスト"

    Dim ws As Worksheet
    Dim testIndex As Integer
    
    For Each ws In Worksheets
        Set matcher = regExp.Execute(ws.name)
        If matcher.count > 0 Then
            ' テストシート名取得
            testIndex = matcher(0).SubMatches(0)
            If testList.ContainsKey(testIndex) Then
                ' 重複した場合エラー
                MsgBox "数字が重複しているシートがあります。" & vbLf & ws.name & vbLf & testList(testIndex).name
            Else
                testList(testIndex) = ws
            End If
        End If
    Next
    
    Set テストシート取得 = testList
End Function

Function テストパターン設定() As Json
    Set testTable = New Json
    
    Dim testList As Json
    Set testList = テストシート取得
    
    Dim tests As New Json
    Dim ws As Worksheet
    Dim item
    
    testCount = 0
    
    For Each item In testList.Items
        Set ws = item
        tests.Concat テストシート読み込み(ws)
    Next
    
    Set テストパターン設定 = tests
End Function

Function テストシート読み込み(ws As Worksheet) As Json
    Dim sheet As Json
    Set sheet = シート取り込み(ws, "大項目")
    
    Dim Test As New Json
    
    Dim caption As String
    
    Dim i As Integer
    
    For i = 0 To sheet("data").count - 1
        If sheet("data")(i).ContainsKey("大項目") Then
            ' 大項目が設定されている箇所から新規データ
            caption = sheet("data")(i)("大項目")
            If caption = "初期設定" Then
                caption = "setUp"
            ElseIf caption = "終了設定" Then
                caption = "tearDown"
            Else
                testCount = testCount + 1
                caption = CStr(testCount) + " " + caption
            End If
            Test(caption) = New Json
            testTable(caption) = New Json
            testTable(caption)("sheet") = ws
            testTable(caption)("index") = sheet("data")(i)("rowIndex")
        End If
        If sheet("data")(i).ContainsKey("項目名") Then
            Dim command As Json
            Set command = New Json
            Test(caption).Push command
            
            If sheet("data")(i).ContainsKey("中項目") Then
                command("caption") = sheet("data")(i)("中項目")
            End If
            command("comment") = sheet("data")(i)("項目名")
            If sheet("data")(i).ContainsKey("続行") Then
                If sheet("data")(i)("続行") = "○" Then
                    command("error_continue") = "True"
                End If
            End If
            If sheet("data")(i).ContainsKey("再実行") Then
                If sheet("data")(i)("再実行") = "○" Then
                    command("retry_point") = "True"
                End If
            End If
            command("command") = New Json
            command("command").Push sheet("data")(i)("コマンド")
            Dim argIndex As Integer
            argIndex = 1
            Do While sheet("data")(i).ContainsKey("引数" + CStr(argIndex))
                command("command").Push sheet("data")(i)("引数" + CStr(argIndex))
                argIndex = argIndex + 1
            Loop
        End If
    Next
    
    Set テストシート読み込み = Test
End Function

Sub テスト実行(setting As Json)
    Dim command As String
    command = setting("コマンド") & " " & setting("テスト実行オプション") & " " & setting("baseDir") & setting("ファイル名")

    Dim ws As Worksheet
    Dim caption
    For Each caption In testTable.keys
        Set ws = testTable(caption)("sheet")
        Set testHeader = ヘッダ取得(ws)
        browserName = ""
        
        クリアシート ws, "実行日付", "結果"
    Next
   
    実行 command, "結果出力"
End Sub

Sub 質問文作成実行(setting As Json)
    Dim command As String
    command = setting("コマンド") & " " & setting("ドキュメント作成オプション") & " " & setting("baseDir") & setting("ファイル名")
    
    Set testHeader = ヘッダ取得(Worksheets("0 テスト-初期設定 終了処理"))
    
    実行 command, "テスト出力"
End Sub

Sub 実行(command As String, outExecSub As String)
    ログ出力 "テスト実行"
    
    Set testSheet = Nothing
   
    Dim WSH, wExec, result As String
   
    Set WSH = CreateObject("WScript.Shell")
    ログ出力 "%ComSpec% /c " & command
    Set wExec = WSH.Exec("%ComSpec% /c " & command)
    Do While wExec.Status <> 1 Or wExec.StdOut.AtEndOfStream = False
        DoEvents
        result = wExec.StdOut.ReadLine
        If result <> "" And result <> "#" Then
            If outExecSub = "結果出力" Then
                結果出力 result
            ElseIf outExecSub = "テスト出力" Then
                テスト出力 result
            ElseIf outExecSub = "コマンド" Then
                コマンド出力 result
            End If
            
            ログ出力 result
        End If
    Loop
End Sub

Sub ログ出力(message As String)
    Dim ws As Worksheet
    Set ws = Worksheets("ログ")
    Dim rowIndex As Long
    rowIndex = ws.Cells(Rows.count, 1).End(xlUp).Row + 1
    ws.Cells(rowIndex, 1).value = DateTime.Now
    ws.Cells(rowIndex, 1).NumberFormatLocal = "yyyy/m/d h:mm:ss"
    ws.Cells(rowIndex, 2).value = message
    ws.Cells(rowIndex, 2).NumberFormatLocal = "@"
    Dim aws As Worksheet
    Set aws = ActiveSheet
    ws.Activate
    ws.Cells(rowIndex, 2).Select
    aws.Activate
End Sub

Sub 結果出力(message As String)
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    
    regExp.Pattern = "^browser:(.*)$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' ブラウザ名取得
        browserName = matcher(0).SubMatches(0)
    End If
    
    regExp.Pattern = "^実行:(([0-9]* )?(.*))$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' 大項目行
        Dim testName As String
        testName = matcher(0).SubMatches(2)
        If testName = "setUp" Or testName = "tearDown" Then
            Set testSheet = Nothing
            Exit Sub
        End If
        
        Set testSheet = testTable(matcher(0).SubMatches(0))("sheet")
        testStartIndex = testTable(matcher(0).SubMatches(0))("index")
        Exit Sub
    End If

    If testSheet Is Nothing Then
        Exit Sub
    End If
    
    regExp.Pattern = "    (not )?ok ([0-9]+)"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        Dim outRowIndex As Integer
        outRowIndex = matcher(0).SubMatches(1) + testStartIndex
        testSheet.Cells(outRowIndex, testHeader("実行日付")).value = Date
        Dim result As String
        If matcher(0).SubMatches(0) = "" Then
            result = browserName & ":○"
        Else
            result = browserName & ":×"
        End If
        
        If testSheet.Cells(outRowIndex, testHeader("結果")).value = "" Then
            testSheet.Cells(outRowIndex, testHeader("結果")).value = result
        Else
            testSheet.Cells(outRowIndex, testHeader("結果")).value = testSheet.Cells(outRowIndex, testHeader("結果")).value & vbLf & result
        End If
    End If

End Sub

Sub テスト出力(message As String)
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    
    regExp.Pattern = "^大項目:(([0-9]* )?(.*))$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' 大項目行
        Dim testName As String
        testName = matcher(0).SubMatches(2)
        
        Set testSheet = testTable(matcher(0).SubMatches(0))("sheet")
        testStartIndex = testTable(matcher(0).SubMatches(0))("index")
        Exit Sub
    End If

    If testSheet Is Nothing Then
        Exit Sub
    End If
    
    regExp.Pattern = "    ([0-9]+) (.*)$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        Dim no As Integer
        no = matcher(0).SubMatches(0)
        testSheet.Cells(testStartIndex + no, testHeader("手順")).value = matcher(0).SubMatches(1)
    End If
End Sub

Sub コマンド出力(message As String)
    Dim ws As Worksheet
    Set ws = Worksheets("コマンド")
    Dim rowIndex As Long
    rowIndex = ws.Cells(Rows.count, 1).End(xlUp).Row + 1
    Dim columnIndex As Integer
    columnIndex = 1
    
    Dim data
    For Each data In Split(message, vbTab)
        ws.Cells(rowIndex, columnIndex).value = data
        columnIndex = columnIndex + 1
    Next
    
    Dim aws As Worksheet
    Set aws = ActiveSheet
    ws.Activate
    ws.Cells(rowIndex, 1).Select
    aws.Activate
End Sub

Function ブラウザ設定(ws As Worksheet) As Json
    Dim sheet As Json
    Set sheet = シート取り込み(ws, "ラベル")
    
    Dim browserTable As New Json
    Dim browser As Json
    
    Dim i As Integer, key
    
    For i = 0 To sheet("data").count - 1
        Set browser = New Json
        For Each key In sheet("data")(i).keys
            If key = "ラベル" Then
                Set browserTable(sheet("data")(i)(key)) = browser
            ElseIf key = "その他" Then
                Dim data, pair
                For Each data In Split(sheet("data")(i)(key), ",")
                    pair = Split(data, ":", 2)
                    browser(Trim(pair(0))) = Trim(pair(1))
                Next
            Else
                browser(key) = sheet("data")(i)(key)
            End If
        Next
    Next
    
    Set ブラウザ設定 = browserTable
End Function

Function テストブラウザ設定(setting As Json, settingFile As Json) As Json
    Dim testbrowserList As New Json
    
    Dim key
    For Each key In settingFile("initialize")("browserlist").keys
        If setting(key) Then
            testbrowserList.Push (key)
        End If
    Next
    
    Set テストブラウザ設定 = testbrowserList
End Function


Sub ブラウザ設定反映()
    ' 設定の取り込み
    Dim setting As Json
    Set setting = シート取り込み縦(Worksheets("設定"))
    
    Dim bws As Worksheet, settingws As Worksheet
    Set bws = Worksheets("ブラウザ設定")
    Set settingws = Worksheets("設定")
    
    Dim bRowIndex As Integer, sRowIndex As Integer
    bRowIndex = 2
    sRowIndex = 1
    Do While settingws.Cells(sRowIndex, 1).value <> "実行ブラウザ"
        sRowIndex = sRowIndex + 1
    Loop
    sRowIndex = sRowIndex + 1
    
    Dim cb As CheckBox
    Do While bws.Cells(bRowIndex, 1).value <> ""
        If settingws.Cells(sRowIndex, 1).value <> bws.Cells(bRowIndex, 1).value Then
            ' 異なる場合、ラベル追加
            settingws.Cells(sRowIndex, 1).value = bws.Cells(bRowIndex, 1).value
            
            ' チェックボックス同期
            Set cb = RangeToCheckBox(settingws.Cells(sRowIndex, 2))
            With settingws.Cells(sRowIndex, 2)
                .HorizontalAlignment = xlHAlignRight
                If cb Is Nothing Then
                    ' チェックボックス追加
                    Set cb = settingws.CheckBoxes.Add(.Left - 0.5, .Top - 1.5, 0, 0)
                    cb.OnAction = "チェック_Click"
                    cb.caption = ""
                End If
    
                If setting.ContainsKey(settingws.Cells(sRowIndex, 1).value) Then
                    If setting(settingws.Cells(sRowIndex, 1).value) Then
                        .value = True
                        cb.value = 1
                    Else
                        .value = False
                        cb.value = 0
                    End If
                Else
                    .value = False
                    cb.value = 0
                End If
            End With
        End If
        bRowIndex = bRowIndex + 1
        sRowIndex = sRowIndex + 1
    Loop
    
    ' 不要な部分を削除
    Do While settingws.Cells(sRowIndex, 1).value <> ""
        settingws.Cells(sRowIndex, 1).value = ""
        settingws.Cells(sRowIndex, 2).value = ""
        Set cb = RangeToCheckBox(settingws.Cells(sRowIndex, 2))
        If Not cb Is Nothing Then
            cb.Delete
        End If
    Loop
End Sub

Sub 画面構成要素設定(rowIndex As Integer)
    Dim ws As Worksheet
    Set ws = Worksheets("画面構成要素")
    
    Dim isExist As Boolean
    
    
    If ws.Cells(rowIndex, 1) = "" And ws.Cells(rowIndex, 2) = "" And ws.Cells(rowIndex, 3) = "" And ws.Cells(rowIndex, 4) = "" And ws.Cells(rowIndex, 5) = "" And ws.Cells(rowIndex, 6) = "" Then
        ' 全部消去
        isExist = False
    Else
        ' 入力あり
        isExist = True
    End If
    
    If isExist And ws.Cells(rowIndex, 8).FormulaR1C1 <> "" Or Not isExist And ws.Cells(rowIndex, 8).FormulaR1C1 = "" Then
        ' すでに計算式が設定されている場合は終了
        Exit Sub
    End If
    
    If Not isExist Then
        ws.Cells(rowIndex, 8).value = ""
        ws.Cells(rowIndex, 9).value = ""
        ws.Cells(rowIndex, 10).value = ""
        ws.Cells(rowIndex, 11).value = ""
        ws.Cells(rowIndex, 12).value = ""
        ws.Cells(rowIndex, 13).value = ""
        Exit Sub
    End If
    
    ws.Cells(rowIndex, 8).FormulaR1C1 = "=IF(RC[-3]="""","""",IF(RC[-7]<>"""",RC[-7],R[-1]C))"
    ws.Cells(rowIndex, 9).FormulaR1C1 = "=IF(RC[-4]="""","""",IF(RC[-7]<>"""",RC[-7],R[-1]C))"
    ws.Cells(rowIndex, 10).FormulaR1C1 = "=IF(RC[-5]="""","""",IF(RC[-8]<>"""","""",IF(RC[-7]<>"""",RC[-7],R[-1]C)))"
    ws.Cells(rowIndex, 11).FormulaR1C1 = "=IF(RC[-7] <> """", RC[-7], """")"
    ws.Cells(rowIndex, 12).FormulaR1C1 = "=RC[-4] & ""/"" &RC[-3] & IF(RC[-2] = """", """", ""/"" & RC[-2] & IF(RC[-1] = """","""", ""/"" & RC[-1]))"
    ws.Cells(rowIndex, 13).FormulaR1C1 = "=IF(RC[-4] = """", """", ""「"" & RC[-5] & ""」の「"" & RC[-4] & ""」"" & IF(RC[-3] = """", """", ""の「"" & RC[-3] & ""」"" & IF(RC[-2] = """","""", ""の「"" & RC[-2] & ""」"")))"

    Dim tableRange As Range
    Set tableRange = Range(ws.Cells(rowIndex, 1), ws.Cells(rowIndex, 6))
    
    tableRange.Borders.LineStyle = xlContinuous
    
End Sub
