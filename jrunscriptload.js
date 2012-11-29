importPackage(java.lang);

var current_dir = curDir.getAbsolutePath();
var script_dir = current_dir;

// このファイルが2度以上読まれたときへの対処
if (!("orig_load" in this)) {
  this.orig_load = load;
}
function readFile(fileName) {
    var
    st = inStream(fileName)
    ,buffer = javaByteArray(4096)
    ,fileString = ''
    ,readLength
    ;
    
    while (true) {
        readLength = st.read(buff);
        if (readLength == 0) {
            break;
        }

        fileString = fileString + new java.lang.String(buff);
    }

    return fileString;
}
if (!("orig_readFile" in this)) {
  this.orig_readFile = readFile;
}

// 相対パスを絶対パスに直す、絶対パスならそのまま
function completePath(file, isScript) {
    var path;
    if (file.match(/^[\\\/]/) || file.match(/^[A-Z]:[\\\/]/i)) {
        // absolute path
        path = file;
    } else {
        if (isScript) {
            path = script_dir + File.separator + file;
        }
        else {
            path = current_dir + File.separator + file;
        }
    }
    return path;
}

// カレントディレクトリを考慮するreadFile
function my_readFile(file) {
    var path = completePath(file);
    return orig_readFile(path);
}

// カレントディレクトリを考慮するload
function my_load(file) {
    var path = completePath(file, true);
    return orig_load(path);
}

// load, readFileを、自前関数で上書きする
this.load = my_load;
this.readFile = my_readFile;

if (arguments.length > 0) {
    // スクリプトが指定ありの場合
    var script_work = arguments.shift().split(File.separator);
    var script = script_work.pop();
    // 末尾を削除
    script_dir = script_work.join(File.separator);
    if (script_dir == '') {
        script_dir = '.';
    }

    // 実行
    load(script);
}
