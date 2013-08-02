VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "Json"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = False
Attribute VB_Exposed = False
' コメント追加
Option Explicit
 
Private Const DEFAULT_INDENT As Integer = 4

'Private m_Dictionary As Object
Private m_Dictionary As Dictionary
Private m_Array()   As Variant
Private isUseArray  As Boolean

' 初期化
Private Sub Class_Initialize()
    isUseArray = False
    
    
End Sub

' 配列か
Public Property Get IsArray() As Boolean
    IsArray = isUseArray
End Property

' 要素を取得（既定プロパティ）
Public Property Get item(key) As Variant
Attribute item.VB_UserMemId = 0
    If m_Dictionary Is Nothing And isUseArray And IsNumeric(key) Then
        If LBound(m_Array) <= key And key <= UBound(m_Array) Then
            ' 配列の場合
            If IsObject(m_Array(key)) Then
                Set item = m_Array(key)
            Else
                item = m_Array(key)
            End If
            Exit Property
        End If
    End If
    If Not m_Dictionary Is Nothing Then
        ' ハッシュ
        If m_Dictionary.Exists(key) Then
            If IsObject(m_Dictionary(key)) Then
                Set item = m_Dictionary(key)
            Else
                item = m_Dictionary(key)
            End If
            Exit Property
        End If
    End If
    ' 見つからない場合
    Set item = Nothing
End Property

' 要素を設定（既定プロパティ）
'  key 要素番号
'  Value 追加する値（代入式の右辺）
Public Property Let item(key, value)
Attribute item.VB_UserMemId = 0
    setItem key, value
End Property
Public Property Set item(key, value)
Attribute item.VB_UserMemId = 0
    setItem key, value
End Property

Private Sub setItem(key, value)
    If m_Dictionary Is Nothing And IsNumeric(key) Then
        If Not isUseArray Then
            ' 初めて配列として利用する場合
            ReDim m_Array(0)
            isUseArray = True
        End If
        If LBound(m_Array) <= key Then
            ' 配列の場合
            If UBound(m_Array) < key Then
                ' 拡張あり
                ReDim Preserve m_Array(key)
            End If
            If IsObject(value) Then
                Set m_Array(key) = value
            Else
                m_Array(key) = value
            End If
            Exit Sub
        End If
    End If
        
    If m_Dictionary Is Nothing Then
        ' 配列をハッシュ化
        Set m_Dictionary = CreateObject("Scripting.Dictionary")
        If isUseArray Then
            ' 配列として利用していた場合
            Dim i As Integer
            For i = LBound(m_Array) To UBound(m_Array)
                m_Dictionary(i) = m_Array(i)
            Next
            ' 解放
            ReDim m_Array(0)
            isUseArray = False
        End If
    End If
    
    ' ハッシュ設定
    If IsObject(value) Then
        Set m_Dictionary(key) = value
    Else
        m_Dictionary(key) = value
    End If
End Sub


' 要素数を取得
Public Property Get count() As Long
    If m_Dictionary Is Nothing Then
        If isUseArray Then
            count = UBound(m_Array) - LBound(m_Array) + 1
        Else
            count = 0
        End If
    Else
        count = m_Dictionary.count
    End If
End Property

' 値のコレクションを取得
Public Property Get Items()
    If m_Dictionary Is Nothing Then
        If isUseArray Then
            Items = m_Array
        Else
            Items = New Collection
        End If
    Else
        Items = m_Dictionary.Items()
    End If
End Property

' キーのコレクションを取得
Public Property Get keys()
    If m_Dictionary Is Nothing Then
        If isUseArray Then
            Dim arrayKeys As New Collection
            Dim i As Integer
            For i = LBound(m_Array) To UBound(m_Array)
                arrayKeys.Add i
            Next
            keys = arrayKeys
        Else
            keys = New Collection
        End If
    Else
        keys = m_Dictionary.keys()
    End If
End Property

' 特定位置の要素を削除
Public Function RemoveKey(key) As Boolean
    If m_Dictionary Is Nothing And IsNumeric(key) Then
        If Not isUseArray Then
            RemoveKey = False
            Exit Function
        End If
        If LBound(m_Array) <= key And key <= UBound(m_Array) Then
            ' 配列の場合
            Delete CInt(key)
            RemoveKey = True
            Exit Function
        End If
    End If
    If Not m_Dictionary Is Nothing Then
        ' ハッシュ
        If m_Dictionary.Exists(key) Then
            m_Dictionary.Remove (key)
            RemoveKey = True
            Exit Function
        End If
    End If
    RemoveKey = False
End Function

' キーが含まれているかチェック
Public Function ContainsKey(key) As Boolean
    If m_Dictionary Is Nothing And IsNumeric(key) Then
        If Not isUseArray Then
            ContainsKey = False
            Exit Function
        End If
        If LBound(m_Array) <= key And key <= UBound(m_Array) Then
            ' 配列の場合
            ContainsKey = True
            Exit Function
        End If
    End If
    If Not m_Dictionary Is Nothing Then
        ' ハッシュ
        If m_Dictionary.Exists(key) Then
            ContainsKey = True
            Exit Function
        End If
    End If
    ContainsKey = False
End Function

' 配列として末尾に追加
Public Sub Push(value)
    If m_Dictionary Is Nothing Then
        If isUseArray Then
            item(UBound(m_Array) + 1) = value
        Else
            ReDim m_Array(0)
            item(LBound(m_Array)) = value
        End If
    Else
        Err.Raise 5
    End If
End Sub

' 配列として末尾を削除
Public Function Pop()
    If m_Dictionary Is Nothing Then
        If LBound(m_Array) <= UBound(m_Array) Then
            On Error Resume Next
            Pop = m_Array(UBound(m_Array))
            Set Pop = m_Array(UBound(m_Array))
            On Error GoTo 0

            Delete UBound(m_Array)
            Exit Function
        End If
    End If
        
    Err.Raise 5
End Function

' 配列として先頭に追加
Public Sub Unshift(value)
    If isUseArray Then
        Insert LBound(m_Array), value
    Else
        ReDim m_Array(0)
        item(LBound(m_Array)) = value
    End If
End Sub

' 配列として先頭を削除
Public Function Shift()
    If isUseArray Then
        Shift = m_Array(LBound(m_Array))
        Delete LBound(m_Array)
    Else
        Err.Raise 5
    End If
End Function

' 要素の削除
Public Sub Delete(start As Integer, Optional count As Integer = 1)
    If Not isUseArray Then
        Err.Raise 5
    End If
    If start + count < UBound(m_Array) Then
        Dim i As Integer
        For i = start To UBound(m_Array) - count
            item(i) = item(i + count)
        Next
    End If
    If UBound(m_Array) - count >= 0 Then
        ReDim Preserve m_Array(UBound(m_Array) - count)
    Else
        isUseArray = False
    End If
End Sub

' 要素の追加
Public Sub Insert(start As Integer, ParamArray values() As Variant)
    If isUseArray Then
        Dim count As Integer
        count = UBound(values) - LBound(values) + 1
        
        ' 拡張してコピー
        Dim i As Integer
        For i = UBound(m_Array) To start Step -1
            item(i + count) = item(i)
        Next
    End If
    
    ' 追加の値を設定
    Dim insertIndex As Integer
    insertIndex = start
    For i = LBound(values) To UBound(values)
        item(insertIndex) = values(i)
        insertIndex = insertIndex + 1
    Next
End Sub

' 末尾に追加
Public Sub Concat(concatJson As Json)
    If m_Dictionary Is Nothing And concatJson.IsArray Then
        ' 配列の場合は末尾に追加
        Dim i As Integer
        For i = LBound(concatJson.Items) To UBound(concatJson.Items)
            Push concatJson(i)
        Next
    Else
        ' ハッシュの場合は上書き
        Dim key
        For Each key In concatJson.keys
            item(key) = concatJson(key)
        Next
    End If
End Sub

' JSON文字列トークンに変換
Public Function ToJsonToken() As Json
    Dim outBuffer As New Json
    If isUseArray Then
        ' 配列の場合
        outBuffer.Push "["
        Dim i As Integer
        For i = LBound(m_Array) To UBound(m_Array)
            ' データをトークンに変換
            outBuffer.Concat objectToJsonToken(m_Array(i))
            outBuffer.Push ","
        Next
        ' 最後のカンマを削除
        outBuffer.Pop
        outBuffer.Push "]"
    ElseIf Not m_Dictionary Is Nothing Then
        ' ハッシュの場合
        outBuffer.Push "{"
        Dim key
        For Each key In keys
            outBuffer.Push escapeString(CStr(key))
            outBuffer.Push ":"
            ' Itemをトークンに変換
            outBuffer.Concat objectToJsonToken(item(key))
            outBuffer.Push ","
        Next
        ' 最後のカンマを削除
        outBuffer.Pop
        outBuffer.Push "}"
    Else
        ' データがない場合
        outBuffer.Push "~"
    End If
    
    Set ToJsonToken = outBuffer
End Function

' dataをJSON文字列トークンに変換
Private Function objectToJsonToken(data) As Json
    Dim outBuffer As New Json
    Dim childJson As Json
    On Error Resume Next
    Set childJson = data
    On Error GoTo 0
    If Not childJson Is Nothing Then
        ' ネストしている場合は再帰
        outBuffer.Concat childJson.ToJsonToken
    ElseIf VarType(data) = vbString Then
        ' 文字列の場合はエスケープ
        outBuffer.Push escapeString(CStr(data))
    ElseIf VarType(data) = vbBoolean Then
        ' true/false
        If data Then
            outBuffer.Push "true"
        Else
            outBuffer.Push "false"
        End If
    Else
        ' その他数値は文字列化
        outBuffer.Push CStr(data)
    End If
    
    Set objectToJsonToken = outBuffer
End Function

' 反転
Public Sub Reverse()
    Dim i As Integer
    Dim lowIndex As Integer
    Dim upIndex As Integer
    Dim temp
    For i = 0 To (UBound(m_Array) - LBound(m_Array) + 1) / 2 - 1
        lowIndex = i + LBound(m_Array)
        upIndex = UBound(m_Array) - i
        If IsObject(m_Array(lowIndex)) Then
            Set temp = m_Array(lowIndex)
        Else
            temp = m_Array(lowIndex)
        End If
        
        If IsObject(m_Array(upIndex)) Then
            Set m_Array(lowIndex) = m_Array(upIndex)
        Else
            m_Array(lowIndex) = m_Array(upIndex)
        End If
        
        If IsObject(temp) Then
            Set m_Array(upIndex) = temp
        Else
            m_Array(upIndex) = temp
        End If
    Next
End Sub

' ファイル書き込み
Public Sub SaveFile(filename As String)
    ' トークンに変換
    Dim jsonToken As Json
    Set jsonToken = ToJsonToken
    
    Dim fileNo As Integer
    fileNo = FreeFile
    
    Open filename For Output As #fileNo
    Dim indentLevel As Integer
    indentLevel = 0
    Dim token As Variant
    For Each token In jsonToken.Items
        If token = "}" Or token = "]" Then
            ' 改行
            Print #fileNo, ""
            ' インデント
            indentLevel = indentLevel - 1
            Print #fileNo, String(indentLevel * DEFAULT_INDENT, " ");
        End If
        
        Print #fileNo, token;
        
        If token = "{" Or token = "[" Then
            ' 改行
            Print #fileNo, ""
            ' インデント
            indentLevel = indentLevel + 1
            Print #fileNo, String(indentLevel * DEFAULT_INDENT, " ");
        ElseIf token = "," Then
            ' 改行
            Print #fileNo, ""
            ' インデント
            Print #fileNo, String(indentLevel * DEFAULT_INDENT, " ");
        End If
    Next
    Close #fileNo

End Sub

' YAMLファイル書き込み
Public Sub SaveYamlFile(filename As String)
    Dim fileNo As Integer
    fileNo = FreeFile
    
    Dim line As String
    Dim matches As MatchCollection
    Dim match As match
    Dim indent As Integer
    Dim currentIndent As Integer
    Dim key As String
    Dim value As String
    
    Dim jsonList As New Json
    
    Dim currentJson As Json
    Dim newJson As Json

    Set currentJson = Me
    
    currentIndent = 0
    
    Open filename For Output As #fileNo
    
    ' ループ
    
    If currentJson.IsArray Then
    End If
    
    
    Do Until EOF(fileNo)
        Line Input #fileNo, line
        ' インデントチェック
        Set matches = regIndent.Execute(line)
        indent = Len(matches.item(0).SubMatches(0))
        
        If currentIndent > indent Then
            ' インデントが浅くなった場合
            Do Until currentIndent <= indent
                ' 前のインデント以下になるまでループ
                Set newJson = jsonList.Pop()
                currentIndent = newJson("indent")
                Set currentJson = newJson("node")
            Loop
            
        End If
        currentIndent = indent
        
        Set matches = regArray.Execute(line)
        If matches.count > 0 Then
            ' リスト
            Set match = matches.item(0)
            value = match.SubMatches(3)
            If value <> "" Then
                value = Replace(value, "''", "'")
            Else
                value = match.SubMatches(1)
            End If
            If value = "" Then
                ' ネスト
                Set newJson = New Json
                newJson("indent") = indent
                newJson("node") = currentJson
                jsonList.Push newJson
                
                Set newJson = New Json
                
                currentJson.Push newJson
                Set currentJson = newJson
            Else
                currentJson.Push value
            End If
            GoTo LoopEnd
        End If
        Set matches = regHash.Execute(line)
        If matches.count > 0 Then
            ' ハッシュ
            Set match = matches.item(0)
            key = match.SubMatches(2)
            If key <> "" Then
                key = Replace(key, "''", "'")
            Else
                key = match.SubMatches(0)
            End If
            
            value = match.SubMatches(7)
            If value <> "" Then
                value = Replace(value, "''", "'")
            Else
                value = match.SubMatches(5)
            End If
            
            If value = "" Then
                ' ネスト
                Set newJson = New Json
                newJson("indent") = indent
                newJson("node") = currentJson
                jsonList.Push newJson
                
                Set newJson = New Json
                
                currentJson(key) = newJson
                Set currentJson = newJson
            Else
                currentJson(key) = value
            End If

            GoTo LoopEnd
        End If
        
        
LoopEnd:
    Loop
    
    Close #fileNo
End Sub

' YAMLファイル読み込み
Public Sub LoadYamlFile(filename As String)
    Dim regNewLine As New regExp
    Dim regComment As New regExp
    Dim regArray As New regExp
    Dim regHash As New regExp
    Dim regIndent As New regExp
    
    regNewLine.Pattern = "\x0A|\0D\x0A|\0D"
    regNewLine.MultiLine = True
    regComment.Pattern = "#.*$"
    regArray.Pattern = "^ *-( +(('((''|[^'])*)')|[^:]+))?"
    regHash.Pattern = "^ *(('((''|[^'])*)')|[^: ]+) *:( +(('((''|[^'])*)')|[^:]+))?"
    regIndent.Pattern = "^( *)"
    
    Dim matches As MatchCollection
    Dim match As match
    Dim indent As Integer
    Dim currentIndent As Integer
    Dim key As String
    Dim value As String
    
    Dim jsonList As New Json
    
    Dim currentJson As Json
    Dim newJson As Json
    
    Set currentJson = Me
    currentIndent = 0
    
    ' ファイルから全て読み込み
    Dim stream As New ADODB.stream
    stream.Type = adTypeText
    stream.charset = "UTF-8"
    stream.Open
    stream.LoadFromFile filename
    Dim allText As String
    allText = stream.ReadText
    stream.Close
    
    Dim newLine As String
    ' 改行チェック
    Set matches = regNewLine.Execute(allText)
    newLine = matches.item(0).value
    
    ' 改行で分割
    Dim lines As Variant
    lines = Split(allText, newLine)
    
    
    Dim line
    For Each line In lines
        ' インデントチェック
        Set matches = regIndent.Execute(line)
        indent = Len(matches.item(0).SubMatches(0))
        
        If currentIndent > indent Then
            ' インデントが浅くなった場合
            Do Until currentIndent <= indent
                ' 前のインデント以下になるまでループ
                Set newJson = jsonList.Pop()
                currentIndent = newJson("indent")
                Set currentJson = newJson("node")
            Loop
            
        End If
        currentIndent = indent
        
        Set matches = regArray.Execute(line)
        If matches.count > 0 Then
            ' リスト
            Set match = matches.item(0)
            value = match.SubMatches(3)
            If value <> "" Then
                value = Replace(value, "''", "'")
            Else
                value = match.SubMatches(1)
            End If
            If value = "" Then
                ' ネスト
                Set newJson = New Json
                newJson("indent") = indent
                newJson("node") = currentJson
                jsonList.Push newJson
                
                Set newJson = New Json
                
                currentJson.Push newJson
                Set currentJson = newJson
            Else
                currentJson.Push value
            End If
            GoTo LoopEnd
        End If
        Set matches = regHash.Execute(line)
        If matches.count > 0 Then
            ' ハッシュ
            Set match = matches.item(0)
            key = match.SubMatches(2)
            If key <> "" Then
                key = Replace(key, "''", "'")
            Else
                key = match.SubMatches(0)
            End If
            
            value = match.SubMatches(7)
            If value <> "" Then
                value = Replace(value, "''", "'")
            Else
                value = match.SubMatches(5)
            End If
            
            If value = "" Then
                ' ネスト
                Set newJson = New Json
                newJson("indent") = indent
                newJson("node") = currentJson
                jsonList.Push newJson
                
                Set newJson = New Json
                
                currentJson(key) = newJson
                Set currentJson = newJson
            Else
                currentJson(key) = value
            End If

            GoTo LoopEnd
        End If
        
        
LoopEnd:
    Next
End Sub

' ファイル読み込み
Public Sub LoadFile(filename As String, Optional charset As String = "UTF-8")
    ' ファイルから全て読み込み
    Dim stream As New ADODB.stream
    stream.Type = adTypeText
    stream.charset = charset
    stream.Open
    stream.LoadFromFile filename
    Dim allText As String
    allText = stream.ReadText
    stream.Close
    
    ' 行頭の空白削除
    Dim regWS As New regExp
    regWS.Pattern = "^(\x20|\x09|\x0A|\0D)*"
    regWS.MultiLine = True
    allText = regWS.Replace(allText, "")
    
    Me.Concat getJsonValue(allText)
End Sub

Function getJsonObject(ByRef text As String) As Json
    Dim result As Json
    Set result = New Json
    
    Dim token As Json
    Set token = getJsonToken(text)
    If token("token") <> "{" Then
        ' フォーマットエラー
        Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。{ではありません。(" & token("token") & ")"
    End If
    
    Dim key As String
    
    Do While token("token") <> "}"
        Set token = getJsonToken(text)
        If token("type") <> "String" And token("type") <> "BareKey" Then
            ' フォーマットエラー
            Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。文字列ではありません。(" & token("token") & ")"
        End If
        
        key = token("token")
    
        Set token = getJsonToken(text)
        If token("token") <> ":" Then
            ' フォーマットエラー
            Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。:ではありません。(" & token("token") & ")"
        End If
        
        Set result(key) = getJsonValue(text)
        
        Set token = getJsonToken(text)
        If token("token") <> "," And token("token") <> "}" Then
            ' フォーマットエラー
            Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。,または}ではありません。(" & token("token") & ")"
        End If
    Loop
    
    Set getJsonObject = result
End Function

Function getJsonArray(ByRef text As String) As Json
    Dim result As Json
    Set result = New Json
    
    Dim token As Json
    Set token = getJsonToken(text)
    If token("token") <> "[" Then
        ' フォーマットエラー
        Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。[ではありません。(" & token("token") & ")"
    End If
    
    Dim key As String
    
    Do While token("token") <> "]"
        result.Push getJsonValue(text)
        
        Set token = getJsonToken(text)
        If token("token") <> "," And token("token") <> "]" Then
            ' フォーマットエラー
            Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。,または]ではありません。(" & token("token") & ")"
        End If
    Loop
    
    Set getJsonArray = result
End Function

Function getJsonValue(ByRef text As String) As Variant
    If Left(text, 1) = "{" Then
        Set getJsonValue = getJsonObject(text)
    ElseIf Left(text, 1) = "[" Then
        Set getJsonValue = getJsonArray(text)
    Else
        Dim token As Json
        Set token = getJsonToken(text)
        If token("type") = "String" Then
            getJsonValue = token("token")
        ElseIf token("type") = "Number" Then
            getJsonValue = CSng(token("token"))
        ElseIf token("type") = "bool" And token("token") = "true" Then
            getJsonValue = True
        ElseIf token("type") = "bool" And token("token") = "false" Then
            getJsonValue = False
        ElseIf token("type") = "null" Then
            Set getJsonValue = Nothing
        Else
            ' フォーマットエラー
            Err.Raise 514, "フォーマットエラー", "不正なフォーマットです。(" & token("token") & ")"
        End If
    End If
End Function

' トークン分割
Public Function getJsonToken(ByRef text As String) As Json
    Dim regString As New regExp
    Dim regSingleString As New regExp
    Dim regNumber As New regExp
    Dim regBool As New regExp
    Dim regNull As New regExp
    Dim regStructure As New regExp
    Dim regWS As New regExp
    Dim regEscape As New regExp
    Dim regBareKey As New regExp
    
    regString.Pattern = "^""((\\[\s\S]|[^\\""])*)"""
    regSingleString.Pattern = "^'((\\[\s\S]|[^\\'])*)'"
    
    regNumber.Pattern = "^-?(0|[1-9]\d*)(\.\d+)?([eE][-+]\d+)?"
    
    regBool.Pattern = "^(true|false)"
    
    regNull.Pattern = "^null"
    
    regWS.Pattern = "^(\x20|\x09|\x0A|\x0D)*"
    regWS.MultiLine = True
    
    regStructure.Pattern = "^[][{}:,]"
    
    regEscape.Pattern = "\\(.)"
    regEscape.Global = True
    
    regBareKey.Pattern = "^[A-Za-z_][A-Za-z0-9_]*"
    
    Dim matches As MatchCollection
    Dim match As match
    Dim submatch As match
    
    Dim token As Json
    Set token = New Json
    
    If Len(text) = 0 Then
        Set getJsonToken = Nothing
        Exit Function
    End If
    
    ' 文字列
    Set matches = regString.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        Dim value As String
        value = match.SubMatches(0)
        
        Set matches = regEscape.Execute(value)
        Dim i As Integer
        For i = matches.count - 1 To 0 Step -1
            Set submatch = matches.item(i)
            If submatch.SubMatches(0) = "n" Then
                value = Left(value, submatch.FirstIndex) & vbLf & Mid(value, submatch.FirstIndex + submatch.Length + 1)
            Else
                value = Left(value, submatch.FirstIndex) & submatch.SubMatches(0) & Mid(value, submatch.FirstIndex + submatch.Length + 1)
            End If
            
        Next
        
        token("token") = value
        token("type") = "String"
        GoTo EndFunction
    End If
    
    ' シングルクォート文字列
    Set matches = regSingleString.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        value = match.SubMatches(0)
        
        Set matches = regEscape.Execute(value)
        For i = matches.count - 1 To 0 Step -1
            Set submatch = matches.item(i)
            If submatch.SubMatches(0) = "n" Then
                value = Left(value, submatch.FirstIndex) & vbLf & Mid(value, submatch.FirstIndex + submatch.Length + 1)
            Else
                value = Left(value, submatch.FirstIndex) & submatch.SubMatches(0) & Mid(value, submatch.FirstIndex + submatch.Length + 1)
            End If
            
        Next
        
        token("token") = value
        token("type") = "String"
        GoTo EndFunction
    End If
    
    ' 数値
    Set matches = regNumber.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        token("token") = match.value
        token("type") = "Number"
        GoTo EndFunction
    End If
    
    ' bool
    Set matches = regBool.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        token("token") = match.value
        token("type") = "bool"
        GoTo EndFunction
    End If
    
    ' null
    Set matches = regNull.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        token("token") = match.value
        token("type") = "null"
        GoTo EndFunction
    End If
    
    ' 6structure
    Set matches = regStructure.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        token("token") = match.value
        token("type") = "6structure"
        GoTo EndFunction
    End If
    
    ' bare KEY
    Set matches = regBareKey.Execute(text)
    If matches.count > 0 Then
        Set match = matches.item(0)
        token("token") = match.value
        token("type") = "BareKey"
        GoTo EndFunction
    End If
    
    ' フォーマットエラー
    Err.Raise 513, "トークンエラー", "不正なトークンです。(" & Left(text, 5) & "...)"

EndFunction:
    text = Mid(text, match.Length + 1)
    ' 続く空白削除
    text = regWS.Replace(text, "")
    
    Set getJsonToken = token
End Function

' 文字列出力用変換
Public Function escapeString(data As String, Optional key As Boolean = False) As String
    Dim regExp
    Set regExp = CreateObject("VBScript.RegExp")
    
    If key Then
        ' キーの場合
        regExp.Pattern = "^[A-Za-z_][A-Za-z0-9_]*$"
        regExp.IgnoreCase = True
        If regExp.Test(data) Then
            escapeString = data
            Exit Function
        End If
    End If
    
    If data = "True" Or data = "False" Then
        escapeString = LCase(data)
        Exit Function
    End If
    
    ' \を変換
    regExp.Pattern = "\\"
    regExp.Global = True
    data = regExp.Replace(data, "\\")
    
    ' 改行を変換
    regExp.Pattern = vbLf
    data = regExp.Replace(data, "\n")

    
    ' どちらも存在する場合はエスケープ
    escapeString = """" + regExp.Replace(data, "\""") + """"
    
End Function

Public Function join(Optional separater As String = ",") As String
    Dim result As String
    Dim i As Integer
    
    result = Me(0)
    For i = 1 To Me.count - 1
        result = result & separater & Me(i)
    Next
    
    join = result
End Function
