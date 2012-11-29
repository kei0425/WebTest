var current_dir = environment["user.dir"];
var script_dir = current_dir;
var sep = environment["file.separator"];

// ���̃t�@�C����2�x�ȏ�ǂ܂ꂽ�Ƃ��ւ̑Ώ�
if (!("orig_load" in this)) {
  this.orig_load = load;
}
if (!("orig_readFile" in this)) {
  this.orig_readFile = readFile;
}

// ���΃p�X���΃p�X�ɒ����A��΃p�X�Ȃ炻�̂܂�
function completePath(file, isScript) {
    var path;
    if (file.match(/^[\\\/]/) || file.match(/^[A-Z]:[\\\/]/i)) {
        // absolute path
        path = file;
    } else {
        if (isScript) {
            path = script_dir + sep + file;
        }
        else {
            path = current_dir + sep + file;
        }
    }
    return path;
}

// �J�����g�f�B���N�g�����l������readFile
function my_readFile(file) {
    var path = completePath(file);
    return orig_readFile(path);
}

// �J�����g�f�B���N�g�����l������load
function my_load(file) {
    var path = completePath(file, true);
    return orig_load(path);
}

// load, readFile���A���O�֐��ŏ㏑������
this.load = my_load;
this.readFile = my_readFile;

if (arguments.length > 0) {
    // �X�N���v�g���w�肠��̏ꍇ
    var script_work = arguments.shift().split(sep);
    var script = script_work.pop();
    // �������폜
    script_dir = script_work.join(sep);
    if (script_dir == '') {
        script_dir = '.';
    }

    // ���s
    load(script);
}
