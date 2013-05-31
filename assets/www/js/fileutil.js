var FileUtil = {
    fileExtension : "pdf,epub,mp3,m4b",
    fileExtensionIcon : {
        pdf : "glyphicon-file",
        epub : "glyphicon-book",
        mp3 : "glyphicon-volume-down",
        m4b : "glyphicon-volume-up",
        dir : "glyphicon-folder-close"
    },
    fileSystem : null,
    rootDirEntry : null,
    baseMediaDirName : "jw_media",
    baseMediaDir : "file:///mnt/sdcard/jw_media",

    init : function() {
        var util = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                            function(fileSystem){
                                util.fileSystem = fileSystem;
                                util.rootDirEntry = fileSystem.root;
                                //console.log("root1 : " + JSON.stringify(util.fileSystem));
                                //console.log("root2 : " + JSON.stringify(fileSystem.root));
                                //console.log("util.baseMediaDir : " + JSON.stringify(util.baseMediaDir));

                            }, this.fail);
/*
        window.resolveLocalFileSystemURI(util.baseMediaDir,
                            function(fileEntry){
                                //console.log("fileEntry : " + JSON.stringify(fileEntry));
                                util.baseMediaDir = fileEntry.getDirectory(util.baseMediaDirName, {create: true});

                            }, this.fail);
*/
    },

    fail : function(evt){
        console.log(evt.target.error.code);
    },

    download : function(uri, filePath, $progressArea, successCallback) {
        var util = this;
        var eURI = encodeURI(uri);
        var fileTransfer = new FileTransfer();

        var fullPath = util.getFullPath(filePath);
        $progressArea.get(0).fullPath = fullPath;

        // 다운로드 성공시의 콜백이 없는경우 기본 콜백을 설정
        // ダウンロード成功時のCallBack設定がない場合のDefault設定
        successCallback = successCallback
                                || function(entry) {
                                        //console.log(JSON.stringify(entry));
                                        console.log("download complete: " + entry.fullPath);
                                   };

        if ($progressArea) {
            $progressArea.trigger('downloadStart', [fileTransfer]);
            fileTransfer.onprogress = function(progressEvent) {
//console.log(JSON.stringify(progressEvent));
                // TODO
                $progressArea.trigger('downloading', [progressEvent]);
            };
        }

        fileTransfer.download(
            eURI,
            fullPath,
            successCallback,
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );
        return fileTransfer;
    },

    getFullPath : function(filePath) {
        return this.baseMediaDir + '/' + filePath;
    },

    getExtension : function(fileName, splitChar) {
        splitChar = splitChar || '.';
        return fileName.substring(fileName.lastIndexOf(splitChar)+1);
    },

    isFile : function(url) {
        var extension = this.getExtension(url);
        return this.fileExtension.lastIndexOf(extension) > -1 ;
    },

    convertToDirFromFileName : function(fileName) {
        var extension = this.getExtension(fileName);
        var fnArray = fileName.split('_');
        var dir = fnArray[1] + "/" + fnArray[2].substring(0, 4) + "_" + fnArray[2].substring(4, 6) + "/" + extension + "/";
        if (extension == "mp3") {
            // KO/2013_07/mp3/w/w_KO_20130715_01.mp3
            return dir + fnArray[0] + "/" + fileName;
        } else {
            // KO/2013_07/pdf/w_KO_20130715.pdf
            return dir + fileName;
        }
    },

    convertToDirFromLink : function(linkStr) {
        var fileName = this.getExtension(linkStr, '/');
        var category = linkStr.match(/media_[a-z]+[/]/g);
//console.log("local file path = " +  category + this.convertToDirFromFileName(fileName));
        return category + this.convertToDirFromFileName(fileName);
    },

    exec : function(filePath, type) {
        window.plugins.webintent.startActivity({
            "action" : "android.intent.action.VIEW",
            "type" : type,
            "url" : filePath},
            function() {},
            function() {alert('Failed to open URL via Android Intent')}
        );
    },

    getFileEntry : function(fullPath, fileName) {
        fileName = fileName || fullPath.substring(fullPath.lastIndexOf('/')+1);
        return new FileEntry(fileName, fullPath);
    },

    getFile : function(callback, fullPath, fileName) {
        var fileEntry = this.getFileEntry(fullPath, fileName);
        fileEntry.file(callback, this.fail);
    },

    getFileFromLink : function(callback, linkStr) {
        return this.getFile(callback, this.getFullPath(this.convertToDirFromLink(linkStr)));
    },

    getDirEntry : function(fullPath) {
//console.log(fullPath);
        var dirName = fullPath.substring(fullPath.lastIndexOf('/')+1);
        return new DirectoryEntry(dirName, fullPath);
    },

    getDirSubEntrys : function(fullPath, callback) {

        var dirEntry = this.getDirEntry(fullPath);
        var directoryReader = dirEntry.createReader();

        directoryReader.readEntries(callback, this.fail);
    },


/*
    saveFile : funtion(fileName, data) {
        var file = this.rootDirEntry.getFile(fileName, {create: true, exclusive: false},
                        function(fileEntry) {
                            fileEntry.createWriter(gotFileWriter, fail);
                        }, fail));

    },

    getJsonFullPath : function(fileName) {
        return this.rootDirEntry.fullPath + fileName;
    }

    readJson : function(fileName, callBack) {

    }
*/
}



var DownloadButtonProgress = {

    downloadStart : function(event, fileTransfer) {
        // button
        var $this = $(this);
        this.$this = $this;

        // 다운로드 중인 mp3, m4b 재생을 위해 미리 풀패스를 설정.
        $this.data('file', this.fullPath);
        var extension = FileUtil.getExtension(this.fullPath);
        if ("mp3,m4b".lastIndexOf(extension) > -1) {
            // 소리라면 다운중에도 재생 가능하기 때문에 버튼을 열어둠.
            $this.trigger('clickRelease');
        } else {
            // 음악 녹음이 아닌경우만 버튼을 블럭해서 다운로드 중에 실행 되는 것을 방지
            $this.attr("disabled", "disabled");
        }

        /*
        this.$cancelButton = $('<span class="glyphicon glyphicon-remove">cancel</span>').appendTo($this).click(function(event) {
                // ダウンロード中止ボタン押下時の処理
                fileTransfer.abort(function(r) {
 console.log(JSON.stringify(r));
                }, FileUtil.fail);
        });
        */

        this.fileTransfer = fileTransfer;
        this.$progressBar = $('<div class="progress-bar" style="width: 0%"/>').appendTo($this).wrap('<div class="progress progress-striped active"/>');
    },

    downloading : function(event, progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentage = Math.ceil(progressEvent.loaded / (progressEvent.total * 2) * 100);

//console.log(percentage + '|' +  progressEvent.loaded + '|' + progressEvent.total);
console.log(JSON.stringify(progressEvent));

            this.$progressBar.css('width', percentage + '%').text(Math.ceil(progressEvent.loaded / 2048) + 'KB / ' + Math.ceil(progressEvent.total / 1024) + 'KB');;

            // this == button
            if (percentage > 99) {
                this.$this.trigger('downloadEnd');
            }
        } else {
            if(statusDom.innerHTML == "") {
                this.$progressBar.html("Loading");
            } else {
                this.$progressBar.html(this.$progressBar.innerHTML += ".");
            }
        }
    },

    downloadEnd : function(event) {
        if (this.$progressBar) {
            //this.$cancelButton.remove();
            this.$progressBar.parent().remove();
            delete this.$progressBar;
        }
        this.$this.trigger('clickRelease');
    },

    clickRelease : function(event) {
        this.$this.addClass('btn-success').removeAttr("disabled");
    }
}


var FileTreeInfo = function(baseFullPath, extra) {
    this.baseFullPath = baseFullPath;
    this.filter = extra.filter;
    this.extra = extra; // {filter, $baseTag, createMediaTag }
    this.fullScan();
};
FileTreeInfo.prototype = {
    baseFullPath : null,
    filter : null,
    tree : null,
    extra : null,

    fullScan : function() {
        this.tree = {
            name : FileUtil.getExtension(this.baseFullPath, '/'),
            fullPath : this.baseFullPath,
            extension : "dir",
            subDirs : {},
            files : {},
            size : 0
        };

        var $baseTag = this.extra && this.extra.$baseTag ? this.extra.$baseTag : null;
        this.addFullScan(this.baseFullPath, this.tree, new Array(this.tree), $baseTag);
    },

    // funnPath 아래의 전 디렉토리와 파일을 검색
    // fullPath下のすべてにディレクトリを検索
    addFullScan : function(fullPath, parent, parentArray, $parentTag) {
        var tree = this;
        FileUtil.getDirSubEntrys(fullPath, function(entries) {
            $.each(entries, function(index, entry) {
                if (tree.filter && !tree.filter(entry)) {
                    // 필터가 있으면 체크해서 필터를 통과 못하면 저장 안함.
                    // フィルタがある場合、フィルタを通らないものは格納しない。
                    return;
                }

                if (entry.isDirectory) {
                    var thisDir = parent.subDirs[entry.name] = {
                        name : entry.name,
                        fullPath : entry.fullPath,
                        extension : "dir",
                        subDirs : {},
                        files : {},
                        size : 0
                    }

                    var newParentArray = (new Array(thisDir)).concat(parentArray);

                    var $thisTag = null;
                    if ($parentTag) {
                        // 화면에 표시할 파일 경로 트리를 작성
                        $thisTag = tree.extra.createMediaTag($parentTag, thisDir);
                    }

                    tree.addFullScan(entry.fullPath, thisDir, newParentArray, $thisTag);
                } else if (entry.isFile) {
                    FileUtil.getFile(function(file) {
//console.log(JSON.stringify(file));

                        file.extension = FileUtil.getExtension(file.name);
                        parent.files[entry.name] = file;

                        for (var i in parentArray) {
                            // すべての親のディレクトリにファイルサイズをプラスしてディレクトリ使用量を計算
                            parentArray[i].size += file.size;
                        }

                        if ($parentTag) {
                            // 화면에 표시할 파일 경로 트리를 작성
                            tree.extra.createMediaTag($parentTag, file);
                        }

                    }, entry.fullPath, entry.name);
                }
            });

        });
    }
}


/*

// progressEvent
{"bubbles":false,"cancelBubble":false,"cancelable":false,"lengthComputable":true,"loaded":13888,"total":1771296,"target":null}

// fileEntry
{"name":"w_KO_20130615.pdf","fullPath":"file:///mnt/sdcard/jw_media/media_magazines/KO/2013_06/pdf/w_KO_20130615.pdf","type":"application/pdf","lastModifiedDate":1369842946000,"size":65079,"start":0,"end":65079}

// dirEntry
 [{"isFile":false,"isDirectory":true,"name":"media_magazines","fullPath":"file:///mnt/sdcard/jw_media/media_magazines","filesystem":null},
 {"isFile":false,"isDirectory":true,"name":"testaaaaa","fullPath":"file:///mnt/sdcard/jw_media/testaaaaa","filesystem":null}]
*/