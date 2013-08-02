Attribute VB_Name = "UnitTest"
Public Function Assert(result As Boolean, Optional message As String = "")
    Dim outMessage As String
    If message <> "" Then
        outMessage = " - " + message
    End If
    If result Then
        Debug.Print "ok" + outMessage
    Else
        Debug.Print "not ok" + outMessage
    End If
    Assert = result
'    Debug.Assert result
End Function

Public Sub AssertEquals(expect, result, Optional message As String)
    Dim ret As Boolean
    ret = Assert(expect = result, message)
    If Not ret Then
        Debug.Print "expect : " + CStr(expect)
        Debug.Print "result : " + CStr(result)
    End If
End Sub
