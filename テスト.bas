Attribute VB_Name = "テスト"
Option Base 0
Sub Test()
    Dim numList As New Json
   
    
    numList.Push 1
    numList.Push 2
    numList.Push 3
    numList.Push 4
    
    AssertEquals 1, numList(0)
    AssertEquals 2, numList(1)
    AssertEquals 3, numList(2)
    AssertEquals 4, numList(3)
    AssertEquals 4, numList.count
    
    numList.Insert 2, "a", "b", "c"
    AssertEquals 1, numList(0)
    AssertEquals 2, numList(1)
    AssertEquals "a", numList(2)
    AssertEquals "b", numList(3)
    AssertEquals "c", numList(4)
    AssertEquals 3, numList(5)
    AssertEquals 4, numList(6)
    AssertEquals 7, numList.count
    
    numList.Delete 2, 3
    AssertEquals 1, numList(0)
    AssertEquals 2, numList(1)
    AssertEquals 3, numList(2)
    AssertEquals 4, numList(3)
    AssertEquals 4, numList.count
    
    Dim jsonToken As Json
    Set jsonToken = numList.ToJsonToken
    
    AssertEquals "[", jsonToken(0)
    AssertEquals "1", jsonToken(1)
    AssertEquals ",", jsonToken(2)
    AssertEquals "2", jsonToken(3)
    AssertEquals ",", jsonToken(4)
    AssertEquals "3", jsonToken(5)
    AssertEquals ",", jsonToken(6)
    AssertEquals "4", jsonToken(7)
    AssertEquals "]", jsonToken(8)
    AssertEquals 9, jsonToken.count
    
    

    
    Dim aaa As New Json
    aaa("a") = "aaa"
    
    s = aaa("a")
    
    aaa("a") = New Json
    aaa("b") = "bbb"
    aaa("a").Push "aaa"
    aaa("a").Push "bbb"
    aaa("a").Push "ccc"

    s = aaa("a").Pop
    
    aaa("a").Push "ddd"
    
    s = aaa("a").Shift
    aaa("a").Unshift "eee"
    
    aaa("a")(2) = "fff"
    
    numList.Concat aaa("a")
    AssertEquals 1, numList(0)
    AssertEquals 2, numList(1)
    AssertEquals 3, numList(2)
    AssertEquals 4, numList(3)
    AssertEquals "eee", numList(4)
    AssertEquals "bbb", numList(5)
    AssertEquals "fff", numList(6)
    AssertEquals 7, numList.count
    
    Set jsonToken = aaa.ToJsonToken
    AssertEquals "{", jsonToken(0)
    AssertEquals "a", jsonToken(1)
    AssertEquals ":", jsonToken(2)
    AssertEquals "[", jsonToken(3)
    AssertEquals """eee""", jsonToken(4)
    AssertEquals ",", jsonToken(5)
    AssertEquals """bbb""", jsonToken(6)
    AssertEquals ",", jsonToken(7)
    AssertEquals """fff""", jsonToken(8)
    AssertEquals "]", jsonToken(9)
    AssertEquals ",", jsonToken(10)
    AssertEquals "b", jsonToken(11)
    AssertEquals ":", jsonToken(12)
    AssertEquals """bbb""", jsonToken(13)
    AssertEquals "}", jsonToken(14)
    AssertEquals 15, jsonToken.count
    
    numList.Delete 4, 3
    
    numList.Reverse
    AssertEquals 4, numList(0)
    AssertEquals 3, numList(1)
    AssertEquals 2, numList(2)
    AssertEquals 1, numList(3)
    AssertEquals 4, numList.count

    numList.Shift
    numList.Reverse
    AssertEquals 1, numList(0)
    AssertEquals 2, numList(1)
    AssertEquals 3, numList(2)
    AssertEquals 3, numList.count
    
    aaa.SaveFile ActiveWorkbook.path + "\aaa.json"
    
    Dim bbb As New Json
    bbb.LoadFile ActiveWorkbook.path + "\aaa.json"

    
    aaa("a") = "aaa"
    
    
    
    s = aaa.escapeString("aaa")
    s = aaa.escapeString("aaa", True)
    s = aaa.escapeString("a""aa", True)
    s = aaa.escapeString("a'aa", True)
    s = aaa.escapeString("a'a""a", True)
    
    s = aaa.escapeString("1aaa", True)
    s = aaa.escapeString("感じ", True)
    s = aaa.escapeString("::", True)
    s = aaa.escapeString("\")
    AssertEquals """\\""", s
  
    ログ出力 "テスト"
End Sub

Sub VBA_de_JSON()
    Dim text As String
    text = "{ ""abc"" : null } "
    
    Dim testJson As New Json
    Set testJson = testJson.getJsonValue(text)
    
    text = "{ ""abc"" : [1,2,3] } "
    Set testJson = testJson.getJsonValue(text)
    
End Sub

Function ConvertJson(objJSON) As Json
    Dim result As New Json
    
    Dim keys
    Set keys = CallByName(objJSON, "$keys", VbMethod)
    Dim i As Integer
    Dim key As String
    For i = 0 To CallByName(keys, "length", VbGet)
        key = CallByName(keys, i, VbGet)
        result(key) = ConvertJson(CallByName(objJSON, key, VbGet))
    Next
    
    Set ConvertJson = result
End Function
