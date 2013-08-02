Attribute VB_Name = "�����e�X�g"
Private testStartIndex As Integer
Private browserName As String
Private testHeader As Json
Private testTable As Json
Private testSheet As Worksheet
Private testCount As Integer

Sub �`�F�b�N_Click()
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


Sub �t�@�C����荞��(testfile As String, Optional saveName As String = "")
    ' �t�@�C���Ǎ�
    Dim testJson As New Json
    testJson.LoadFile testfile, "SJIS"
    
    Dim ws As Worksheet
    Dim setting As Json
    
    ' �u���E�U�ݒ�
    If testJson("initialize").ContainsKey("browserlist") Then
        Set ws = Worksheets("�u���E�U�ݒ�")
        Set setting = �w�b�_�擾(ws)
        �N���A�V�[�g ws
        
        Dim name As Variant
        Dim rowIndex As Integer
        rowIndex = 2
        
        For Each name In testJson("initialize")("browserlist").keys
            ws.Cells(rowIndex, setting("���x��")).value = name
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
            
            ' �c���\��
            If browser.count > 0 Then
                Dim other As String
                other = ""
                Dim otherKey
                
                For Each otherKey In browser.keys
                    other = other & ", " & otherKey & " : " & browser(otherKey)
                Next
                other = Mid(other, 3)
                ws.Cells(rowIndex, setting("���̑�")).value = other
            Else
                ws.Cells(rowIndex, setting("���̑�")).value = ""
            End If
            
            rowIndex = rowIndex + 1
        Next
    End If
    
    ' �ݒ�V�[�g
    Set ws = Worksheets("�ݒ�")
    Set setting = �V�[�g��荞�ݏc(ws)
    
    ws.Cells(setting("�sindex")("baseURL"), 2).value = testJson("initialize")("baseUrl")
    If testJson("initialize").ContainsKey("customcommand") Then
        ws.Cells(setting("�sindex")("�J�X�^���R�}���h"), 2).value = testJson("initialize")("customcommand")
    Else
        ws.Cells(setting("�sindex")("�J�X�^���R�}���h"), 2).value = ""
    End If
    
    If testJson("initialize").ContainsKey("testbrowser") Then
        Dim cb As CheckBox
        For Each name In testJson("initialize")("testbrowser").Items
            Set cb = RangeToCheckBox(ws.Cells(setting("�sindex")(name), 2))
            ws.Cells(setting("�sindex")(name), 2).value = True
            cb.value = 1
        Next
    End If
    
    If saveName <> "" Then
        ' �O���N���̏ꍇ�̓t�@�C�������N���A
        Dim filename As String
        filename = Dir(testfile)
        ws.Cells(setting("�sindex")("baseDir"), 2).value = Replace(testfile, filename, "")
        ws.Cells(setting("�sindex")("�t�@�C����"), 2).value = filename
    End If
    
    ' ��ʍ\���v�f
    Set ws = Worksheets("��ʍ\���v�f")
    Set setting = �w�b�_�擾(ws)
    
    ' �s�폜
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
        ws.Cells(rowIndex, setting("���")).value = gamen
        Set gamenJson = testJson("initialize")("elements")(gamen)
        For Each youso1 In gamenJson.keys
            Set youso1Json = gamenJson(youso1)
            ws.Cells(rowIndex, setting("�v�f��1")).value = youso1
            arr = youso1Json("by").keys
            ws.Cells(rowIndex, setting("�������@")).value = arr(0)
            arr = youso1Json("by").Items
            ws.Cells(rowIndex, setting("�p�^�[��")).value = arr(0)
            youso1Json.RemoveKey ("by")
            rowIndex = rowIndex + 1
            
            For Each youso2 In youso1Json.keys
                Set youso2Json = youso1Json(youso2)
                ws.Cells(rowIndex, setting("�v�f��2")).value = youso2
                arr = youso2Json("by").keys
                ws.Cells(rowIndex, setting("�������@")).value = arr(0)
                arr = youso2Json("by").Items
                ws.Cells(rowIndex, setting("�p�^�[��")).value = arr(0)
                youso2Json.RemoveKey ("by")
                rowIndex = rowIndex + 1
                For Each youso3 In youso2Json.keys
                    Set youso3Json = youso2Json(youso3)
                    ws.Cells(rowIndex, setting("�v�f��3")).value = youso3
                    arr = youso3Json("by").keys
                    ws.Cells(rowIndex, setting("�������@")).value = arr(0)
                    arr = youso3Json("by").Items
                    ws.Cells(rowIndex, setting("�p�^�[��")).value = arr
                    rowIndex = rowIndex + 1
                Next
            Next
        Next
    Next
    
    ' �e�X�g�V�[�g
    Dim testSheetsJson As Json
    Set testSheetsJson = �e�X�g�V�[�g�擾
    
    ' �����e�X�g�V�[�g�폜
    Dim i As Integer
    Application.DisplayAlerts = False
    For i = 0 To testSheetsJson.count - 1
        testSheetsJson(i).Delete
    Next
    Application.DisplayAlerts = True
    
    Set ws = Worksheets("�e�X�g�e���v���[�g")
    Set setting = �w�b�_�擾(ws)
    
    Dim testName
    For Each testName In testJson("test").keys
        Dim testSheetJson As Json
        Set testSheetJson = testJson("test")(testName)
        
        rowIndex = 2
        Dim sheetnameSplit
        If testName = "tearDown" Then
            sheetnameSplit = Split("0 �I���ݒ�", " ", 2)
            Set ws = Worksheets("0 �e�X�g-�����ݒ� �I������")
            rowIndex = ws.UsedRange.Rows.count + 1
        Else
            ' �V�[�g�R�s�[
            Worksheets("�e�X�g�e���v���[�g").Copy After:=ws
            Set ws = ActiveSheet
            If testName = "setUp" Then
                sheetnameSplit = Split("0 �����ݒ�", " ", 2)
                ws.name = "0 �e�X�g-�����ݒ� �I������"
            Else
                sheetnameSplit = Split(testName, " ", 2)
                ws.name = sheetnameSplit(0) & " �e�X�g-" & sheetnameSplit(1)
            End If
        End If
        
        ws.Cells(rowIndex, setting("�區��")).value = sheetnameSplit(1)
        rowIndex = rowIndex + 1
        
        For i = 0 To testSheetJson.count - 1
            Dim testRow As Json
            Set testRow = testSheetJson(i)
            If testRow.ContainsKey("caption") Then
                ws.Cells(rowIndex, setting("������")).value = testRow("caption")
            Else
                ws.Cells(rowIndex, setting("������")).value = ""
            End If
            
            ws.Cells(rowIndex, setting("���ږ�")).value = testRow("comment")
            
            If testRow.ContainsKey("retry_point") Then
                ws.Cells(rowIndex, setting("�Ď��s")).value = "��"
            Else
                ws.Cells(rowIndex, setting("�Ď��s")).value = ""
            End If
            
            If testRow.ContainsKey("error_continue") Then
                ws.Cells(rowIndex, setting("���s")).value = "��"
            Else
                ws.Cells(rowIndex, setting("���s")).value = ""
            End If
            
            ws.Cells(rowIndex, setting("�R�}���h")).value = testRow("command")(0)
            
            Dim paramindex As Integer
            For paramindex = 1 To testRow("command").count - 1
                ws.Cells(rowIndex, setting("����" & paramindex)).value = testRow("command")(paramindex)
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

Sub �e�X�g�t�@�C���쐬���s()
    ' �l�̐ݒ�
    Dim setting As Json
    Set setting = �V�[�g��荞�ݏc(Worksheets("�ݒ�"))
    
    �e�X�g�t�@�C���쐬 setting
    
    ' �R�}���h���s
    �e�X�g���s setting
    
    �T�}��
End Sub

Sub �e�X�g�t�@�C���쐬�h�L�������g�쐬()
    ' �l�̐ݒ�
    Dim setting As Json
    Set setting = �V�[�g��荞�ݏc(Worksheets("�ݒ�"))
    
    �e�X�g�t�@�C���쐬 setting
    
    ' �R�}���h���s
    ���╶�쐬���s setting
End Sub

Sub �R�}���h���X�g�擾()
    ' �l�̐ݒ�
    Dim setting As Json
    Set setting = �V�[�g��荞�ݏc(Worksheets("�ݒ�"))
    
    �e�X�g�t�@�C���쐬 setting
    
    �N���A�V�[�g Worksheets("�R�}���h")
    
    Dim command As String
    command = setting("�R�}���h") & " " & setting("�R�}���h���X�g�擾�I�v�V����") & " " & setting("baseDir") & setting("�t�@�C����")
   
    ���s command, "�R�}���h"
End Sub

Sub �N���A()
    �N���A�V�[�g Worksheets("���O")
    �N���A�V�[�g Worksheets("�T�}��")
    
    Dim testList As Json
    Set testList = �e�X�g�V�[�g�擾
    
    Dim ws
    For Each ws In testList.Items
        �N���A�V�[�g ws, "���s���t", "����"
    Next
End Sub

Sub �N���A�V�[�g(ws, ParamArray deleteColumn())
    ' �w�b�_�擾
    Dim header As Json
    Set header = �w�b�_�擾(ws)
    
    Dim rowIndex As Integer
    rowIndex = header("HeaderRow")
    
    ' �c�����̂��e�[�u���ɓo�^
    Dim deleteTable As New Dictionary
    Dim deleteKey
    For Each deleteKey In deleteColumn
        deleteTable.Add deleteKey, deleteKey
    Next
    
    ' �s���ƂɃ`�F�b�N
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


Sub �T�}��()
    ' �T�}��
    Dim summarySheet As Worksheet
    Set summarySheet = Worksheets("�T�}��")
    
    Dim summaryHeader As Json
    Set summaryHeader = �w�b�_�擾(summarySheet, "���s���t")
    
    ' �󂫌���
    Dim rowIndex As Integer
    rowIndex = summarySheet.Cells(Rows.count, 1).End(xlUp).Row
    
    ' �V�[�g�`�F�b�N
    Dim testSheets As Json
    Set testSheets = �e�X�g�V�[�g�擾
    
    Dim resultJson As Json
    Dim testSheet As Worksheet
    Dim item
    For Each item In testSheets.Items
        Set testSheet = item
        If testSheet.name <> "0 �e�X�g-�����ݒ� �I������" Then
            Dim testJson As Json
            Set testJson = �V�[�g��荞��(testSheet)
            Dim dataRow
            For Each dataRow In testJson("data").Items
                If dataRow.ContainsKey("�區��") Then
                    rowIndex = rowIndex + 1
                    summarySheet.Cells(rowIndex, summaryHeader("�區��")) = dataRow("�區��")
                    summarySheet.Cells(rowIndex, summaryHeader("���ڐ�")) = 0
                    Set resultJson = New Json
                End If
                If dataRow.ContainsKey("���s���t") Then
                    summarySheet.Cells(rowIndex, summaryHeader("���s���t")) = dataRow("���s���t")
                    summarySheet.Cells(rowIndex, summaryHeader("���ڐ�")) = summarySheet.Cells(rowIndex, summaryHeader("���ڐ�")) + 1
                End If
                If dataRow.ContainsKey("����") Then
                    Dim result
                    For Each result In Split(dataRow("����"), vbLf)
                        Dim b
                        b = Split(result, ":")
                        If Not resultJson.ContainsKey(b(0)) Then
                            resultJson(b(0)) = New Json
                            resultJson(b(0))("��") = 0
                            resultJson(b(0))("�~") = 0
                        End If
                        resultJson(b(0))(b(1)) = resultJson(b(0))(b(1)) + 1
                    Next
                    
                    Dim browser
                    Dim outSuccess As Json
                    Dim outFail As Json
                    Set outSuccess = New Json
                    Set outFail = New Json
                    
                    For Each browser In resultJson.keys
                        outSuccess.Push browser & ":" & resultJson(browser)("��")
                        outFail.Push browser & ":" & resultJson(browser)("�~")
                    Next
                    summarySheet.Cells(rowIndex, summaryHeader("����")) = join(outSuccess.Items, vbLf)
                    summarySheet.Cells(rowIndex, summaryHeader("���s")) = join(outFail.Items, vbLf)
                End If
            Next
        End If
    Next
End Sub

Sub ���O�t�e�X�g�t�@�C���쐬(filename As String)
    �e�X�g�t�@�C���쐬 Nothing, filename
End Sub

Function �e�X�g�t�@�C���쐬(setting As Json, Optional filename As String = "") As Json
    ' �l�̐ݒ�
    If setting Is Nothing Then
        Set setting = �V�[�g��荞�ݏc(Worksheets("�ݒ�"))
    Else
        ���O�o�� "�e�X�g�t�@�C���쐬"
    End If
    
    Dim settingFile As New Json
    
    ' �����ݒ�
    settingFile("initialize") = New Json
    settingFile("initialize")("baseUrl") = setting("baseURL")
    settingFile("initialize")("baseDir") = setting("baseDir")
    
    settingFile("initialize")("browserlist") = �u���E�U�ݒ�(Worksheets("�u���E�U�ݒ�"))
    settingFile("initialize")("testbrowser") = �e�X�g�u���E�U�ݒ�(setting, settingFile)
    settingFile("initialize")("elements") = �v�f�ݒ�(Worksheets("��ʍ\���v�f"))
    
    If setting.ContainsKey("�J�X�^���R�}���h") Then
        If setting("�J�X�^���R�}���h") <> "" Then
            settingFile("initialize")("customcommand") = setting("�J�X�^���R�}���h")
        End If
    End If
    
    
    settingFile("test") = �e�X�g�p�^�[���ݒ�
    
    If filename = "" Then
        filename = setting("baseDir") & setting("�t�@�C����")
    End If
        
    settingFile.SaveFile (filename)
    
    Set �e�X�g�t�@�C���쐬 = settingFile
End Function

Function �v�f�ݒ�(settingSheet As Worksheet) As Json
    Dim elements As New Json
    
    Dim rowIndex As Integer, columnIndex As Integer
    Dim headerTable As Json
    Set headerTable = �w�b�_�擾(settingSheet, "���")
    
    Dim lastElement() As Json
    ReDim lastElement(headerTable("�������@") - headerTable("�v�f��1"))
    Set lastElement(1) = elements
    
    rowIndex = headerTable("HeaderRow") + 1
    Dim newElement As Json
    Dim byList As Json
    
    Do While settingSheet.Cells(rowIndex, headerTable("�������@")).value <> ""
        If settingSheet.Cells(rowIndex, 1).value <> "" Then
            ' ��ʖ�����
            Set lastElement(1) = New Json
            elements(settingSheet.Cells(rowIndex, 1).value) = lastElement(1)
        End If
        
        columnIndex = headerTable("�v�f��1")
        Do While settingSheet.Cells(rowIndex, columnIndex).value = "" And columnIndex < headerTable("�������@")
            columnIndex = columnIndex + 1
        Loop
        
        If columnIndex >= headerTable("�������@") Then
            MsgBox "�v�f�����ݒ肳��Ă��܂���"
            Exit Function
        End If
        
        Set newElement = New Json
        Dim elementIndex As Integer
        elementIndex = columnIndex - 1

        lastElement(elementIndex)(settingSheet.Cells(rowIndex, columnIndex).value) = newElement
        Set byList = New Json
        newElement("by") = byList
        byList(settingSheet.Cells(rowIndex, headerTable("�������@")).value) = settingSheet.Cells(rowIndex, headerTable("�p�^�[��")).value
        
        If elementIndex + 1 <= UBound(lastElement) Then
            Set lastElement(elementIndex + 1) = newElement
        End If
        rowIndex = rowIndex + 1
    Loop

    Set �v�f�ݒ� = elements
End Function

' �w�b�_�擾
Function �w�b�_�擾(ws, Optional headColumn As String) As Json
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
    
    ' �w�b�_�̍s������Ă���
    columnTable("HeaderRow") = rowIndex
    
    Set �w�b�_�擾 = columnTable
End Function

' �V�[�g��荞��
Function �V�[�g��荞��(ws As Worksheet, Optional headColumn As String) As Json
    ' �z���荞��
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
                    Err.Raise 514, "�t�H�[�}�b�g�G���[", headColumn & "���݂���܂���B"
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
    
    ' �V�[�g��荞��
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
    
    Set �V�[�g��荞�� = sheet
End Function

' �V�[�g��荞��
Function �V�[�g��荞�ݏc(ws As Worksheet) As Json
    ' �z���荞��
    Dim sheetData
    sheetData = ws.UsedRange.value
    
    Dim rowIndex As Integer
    rowIndex = 1
    
    Dim sheet As New Json
    Set sheet("�sindex") = New Json
    
    Do While rowIndex <= UBound(sheetData, 1)
        sheet("�sindex")(sheetData(rowIndex, 1)) = rowIndex
        sheet(sheetData(rowIndex, 1)) = sheetData(rowIndex, 2)
        rowIndex = rowIndex + 1
    Loop
    
    Set �V�[�g��荞�ݏc = sheet
End Function

Function �e�X�g�V�[�g�擾() As Json
    Dim testList As New Json
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    regExp.Pattern = "^([0-9]+) �e�X�g"

    Dim ws As Worksheet
    Dim testIndex As Integer
    
    For Each ws In Worksheets
        Set matcher = regExp.Execute(ws.name)
        If matcher.count > 0 Then
            ' �e�X�g�V�[�g���擾
            testIndex = matcher(0).SubMatches(0)
            If testList.ContainsKey(testIndex) Then
                ' �d�������ꍇ�G���[
                MsgBox "�������d�����Ă���V�[�g������܂��B" & vbLf & ws.name & vbLf & testList(testIndex).name
            Else
                testList(testIndex) = ws
            End If
        End If
    Next
    
    Set �e�X�g�V�[�g�擾 = testList
End Function

Function �e�X�g�p�^�[���ݒ�() As Json
    Set testTable = New Json
    
    Dim testList As Json
    Set testList = �e�X�g�V�[�g�擾
    
    Dim tests As New Json
    Dim ws As Worksheet
    Dim item
    
    testCount = 0
    
    For Each item In testList.Items
        Set ws = item
        tests.Concat �e�X�g�V�[�g�ǂݍ���(ws)
    Next
    
    Set �e�X�g�p�^�[���ݒ� = tests
End Function

Function �e�X�g�V�[�g�ǂݍ���(ws As Worksheet) As Json
    Dim sheet As Json
    Set sheet = �V�[�g��荞��(ws, "�區��")
    
    Dim Test As New Json
    
    Dim caption As String
    
    Dim i As Integer
    
    For i = 0 To sheet("data").count - 1
        If sheet("data")(i).ContainsKey("�區��") Then
            ' �區�ڂ��ݒ肳��Ă���ӏ�����V�K�f�[�^
            caption = sheet("data")(i)("�區��")
            If caption = "�����ݒ�" Then
                caption = "setUp"
            ElseIf caption = "�I���ݒ�" Then
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
        If sheet("data")(i).ContainsKey("���ږ�") Then
            Dim command As Json
            Set command = New Json
            Test(caption).Push command
            
            If sheet("data")(i).ContainsKey("������") Then
                command("caption") = sheet("data")(i)("������")
            End If
            command("comment") = sheet("data")(i)("���ږ�")
            If sheet("data")(i).ContainsKey("���s") Then
                If sheet("data")(i)("���s") = "��" Then
                    command("error_continue") = "True"
                End If
            End If
            If sheet("data")(i).ContainsKey("�Ď��s") Then
                If sheet("data")(i)("�Ď��s") = "��" Then
                    command("retry_point") = "True"
                End If
            End If
            command("command") = New Json
            command("command").Push sheet("data")(i)("�R�}���h")
            Dim argIndex As Integer
            argIndex = 1
            Do While sheet("data")(i).ContainsKey("����" + CStr(argIndex))
                command("command").Push sheet("data")(i)("����" + CStr(argIndex))
                argIndex = argIndex + 1
            Loop
        End If
    Next
    
    Set �e�X�g�V�[�g�ǂݍ��� = Test
End Function

Sub �e�X�g���s(setting As Json)
    Dim command As String
    command = setting("�R�}���h") & " " & setting("�e�X�g���s�I�v�V����") & " " & setting("baseDir") & setting("�t�@�C����")

    Dim ws As Worksheet
    Dim caption
    For Each caption In testTable.keys
        Set ws = testTable(caption)("sheet")
        Set testHeader = �w�b�_�擾(ws)
        browserName = ""
        
        �N���A�V�[�g ws, "���s���t", "����"
    Next
   
    ���s command, "���ʏo��"
End Sub

Sub ���╶�쐬���s(setting As Json)
    Dim command As String
    command = setting("�R�}���h") & " " & setting("�h�L�������g�쐬�I�v�V����") & " " & setting("baseDir") & setting("�t�@�C����")
    
    Set testHeader = �w�b�_�擾(Worksheets("0 �e�X�g-�����ݒ� �I������"))
    
    ���s command, "�e�X�g�o��"
End Sub

Sub ���s(command As String, outExecSub As String)
    ���O�o�� "�e�X�g���s"
    
    Set testSheet = Nothing
   
    Dim WSH, wExec, result As String
   
    Set WSH = CreateObject("WScript.Shell")
    ���O�o�� "%ComSpec% /c " & command
    Set wExec = WSH.Exec("%ComSpec% /c " & command)
    Do While wExec.Status <> 1 Or wExec.StdOut.AtEndOfStream = False
        DoEvents
        result = wExec.StdOut.ReadLine
        If result <> "" And result <> "#" Then
            If outExecSub = "���ʏo��" Then
                ���ʏo�� result
            ElseIf outExecSub = "�e�X�g�o��" Then
                �e�X�g�o�� result
            ElseIf outExecSub = "�R�}���h" Then
                �R�}���h�o�� result
            End If
            
            ���O�o�� result
        End If
    Loop
End Sub

Sub ���O�o��(message As String)
    Dim ws As Worksheet
    Set ws = Worksheets("���O")
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

Sub ���ʏo��(message As String)
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    
    regExp.Pattern = "^browser:(.*)$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' �u���E�U���擾
        browserName = matcher(0).SubMatches(0)
    End If
    
    regExp.Pattern = "^���s:(([0-9]* )?(.*))$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' �區�ڍs
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
        testSheet.Cells(outRowIndex, testHeader("���s���t")).value = Date
        Dim result As String
        If matcher(0).SubMatches(0) = "" Then
            result = browserName & ":��"
        Else
            result = browserName & ":�~"
        End If
        
        If testSheet.Cells(outRowIndex, testHeader("����")).value = "" Then
            testSheet.Cells(outRowIndex, testHeader("����")).value = result
        Else
            testSheet.Cells(outRowIndex, testHeader("����")).value = testSheet.Cells(outRowIndex, testHeader("����")).value & vbLf & result
        End If
    End If

End Sub

Sub �e�X�g�o��(message As String)
    Dim regExp, matcher
    Set regExp = CreateObject("VBScript.RegExp")
    
    regExp.Pattern = "^�區��:(([0-9]* )?(.*))$"
    Set matcher = regExp.Execute(message)
    If matcher.count > 0 Then
        ' �區�ڍs
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
        testSheet.Cells(testStartIndex + no, testHeader("�菇")).value = matcher(0).SubMatches(1)
    End If
End Sub

Sub �R�}���h�o��(message As String)
    Dim ws As Worksheet
    Set ws = Worksheets("�R�}���h")
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

Function �u���E�U�ݒ�(ws As Worksheet) As Json
    Dim sheet As Json
    Set sheet = �V�[�g��荞��(ws, "���x��")
    
    Dim browserTable As New Json
    Dim browser As Json
    
    Dim i As Integer, key
    
    For i = 0 To sheet("data").count - 1
        Set browser = New Json
        For Each key In sheet("data")(i).keys
            If key = "���x��" Then
                Set browserTable(sheet("data")(i)(key)) = browser
            ElseIf key = "���̑�" Then
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
    
    Set �u���E�U�ݒ� = browserTable
End Function

Function �e�X�g�u���E�U�ݒ�(setting As Json, settingFile As Json) As Json
    Dim testbrowserList As New Json
    
    Dim key
    For Each key In settingFile("initialize")("browserlist").keys
        If setting(key) Then
            testbrowserList.Push (key)
        End If
    Next
    
    Set �e�X�g�u���E�U�ݒ� = testbrowserList
End Function


Sub �u���E�U�ݒ蔽�f()
    ' �ݒ�̎�荞��
    Dim setting As Json
    Set setting = �V�[�g��荞�ݏc(Worksheets("�ݒ�"))
    
    Dim bws As Worksheet, settingws As Worksheet
    Set bws = Worksheets("�u���E�U�ݒ�")
    Set settingws = Worksheets("�ݒ�")
    
    Dim bRowIndex As Integer, sRowIndex As Integer
    bRowIndex = 2
    sRowIndex = 1
    Do While settingws.Cells(sRowIndex, 1).value <> "���s�u���E�U"
        sRowIndex = sRowIndex + 1
    Loop
    sRowIndex = sRowIndex + 1
    
    Dim cb As CheckBox
    Do While bws.Cells(bRowIndex, 1).value <> ""
        If settingws.Cells(sRowIndex, 1).value <> bws.Cells(bRowIndex, 1).value Then
            ' �قȂ�ꍇ�A���x���ǉ�
            settingws.Cells(sRowIndex, 1).value = bws.Cells(bRowIndex, 1).value
            
            ' �`�F�b�N�{�b�N�X����
            Set cb = RangeToCheckBox(settingws.Cells(sRowIndex, 2))
            With settingws.Cells(sRowIndex, 2)
                .HorizontalAlignment = xlHAlignRight
                If cb Is Nothing Then
                    ' �`�F�b�N�{�b�N�X�ǉ�
                    Set cb = settingws.CheckBoxes.Add(.Left - 0.5, .Top - 1.5, 0, 0)
                    cb.OnAction = "�`�F�b�N_Click"
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
    
    ' �s�v�ȕ������폜
    Do While settingws.Cells(sRowIndex, 1).value <> ""
        settingws.Cells(sRowIndex, 1).value = ""
        settingws.Cells(sRowIndex, 2).value = ""
        Set cb = RangeToCheckBox(settingws.Cells(sRowIndex, 2))
        If Not cb Is Nothing Then
            cb.Delete
        End If
    Loop
End Sub

Sub ��ʍ\���v�f�ݒ�(rowIndex As Integer)
    Dim ws As Worksheet
    Set ws = Worksheets("��ʍ\���v�f")
    
    Dim isExist As Boolean
    
    
    If ws.Cells(rowIndex, 1) = "" And ws.Cells(rowIndex, 2) = "" And ws.Cells(rowIndex, 3) = "" And ws.Cells(rowIndex, 4) = "" And ws.Cells(rowIndex, 5) = "" And ws.Cells(rowIndex, 6) = "" Then
        ' �S������
        isExist = False
    Else
        ' ���͂���
        isExist = True
    End If
    
    If isExist And ws.Cells(rowIndex, 8).FormulaR1C1 <> "" Or Not isExist And ws.Cells(rowIndex, 8).FormulaR1C1 = "" Then
        ' ���łɌv�Z�����ݒ肳��Ă���ꍇ�͏I��
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
    ws.Cells(rowIndex, 13).FormulaR1C1 = "=IF(RC[-4] = """", """", ""�u"" & RC[-5] & ""�v�́u"" & RC[-4] & ""�v"" & IF(RC[-3] = """", """", ""�́u"" & RC[-3] & ""�v"" & IF(RC[-2] = """","""", ""�́u"" & RC[-2] & ""�v"")))"

    Dim tableRange As Range
    Set tableRange = Range(ws.Cells(rowIndex, 1), ws.Cells(rowIndex, 6))
    
    tableRange.Borders.LineStyle = xlContinuous
    
End Sub
