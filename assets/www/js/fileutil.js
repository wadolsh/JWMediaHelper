var FileUtil = {
    fileExtend : "pdf,epub,mp3,m4b",
    fileSystem : null,
    rootDirEntry : null,
    baseMediaDirName : "jw_media",
    baseMediaDir : "file:///mnt/sdcard/jw_media",
    downloading : new Array(),

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

        // 다운로드 성공시의 콜백이 없는경우 기본 콜백을 설정
        // ダウンロード成功時のCallBack設定がない場合のDefault設定
        successCallback = successCallback
                                || function(entry) {
                                        //console.log(JSON.stringify(entry));
                                        console.log("download complete: " + entry.fullPath);
                                        $progressArea.data('file', entry.fullPath);
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
            util.getFullPath(filePath),
            successCallback,
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );

        // ダウンロードを開始したオブジェクトを格納
        this.downloading.push(fileTransfer);

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
        return this.fileExtend.lastIndexOf(extension) > -1 ;
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
        var $this = $(this);
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
//console.log(JSON.stringify(progressEvent));

            this.$progressBar.css('width', percentage + '%').text(Math.ceil(progressEvent.loaded / 2048) + 'KB / ' + Math.ceil(progressEvent.total / 1024) + 'KB');;

            if (percentage > 99) {
                this.$progressBar.parent().remove();
                //this.$cancelButton.remove();
                $(this).addClass('btn-success'); //.data('file', '');

                FileUtil.downloading.exclude(this.fileTransfer);
            }
        } else {
            if(statusDom.innerHTML == "") {
                this.$progressBar.html("Loading");
            } else {
                this.$progressBar.html(this.$progressBar.innerHTML += ".");
            }
        }
    }
}


var FileTreeInfo = function(baseFullPath) {
    this.baseFullPath = baseFullPath;
    this.fullScan();
};
FileTreeInfo.prototype = {
    baseFullPath : null,
    tree : null,

    fullScan : function() {
        this.tree = {
            name : FileUtil.getExtension(this.baseFullPath, '/'),
            fullPath : this.baseFullPath,
            subDirs : {},
            files : {},
            size : 0
        };
        this.addFullScan(this.baseFullPath, this.tree, new Array(this.tree));
    },

    addFullScan : function(fullPath, parent, parentArray) {
        var tree = this;
        FileUtil.getDirSubEntrys(fullPath, function(entries) {
            $.each(entries, function(index, entry) {
                if (entry.isDirectory) {
                    var thisDir = parent.subDirs[entry.name] = {
                        name : entry.name,
                        fullPath : entry.fullPath,
                        subDirs : {},
                        files : {},
                        size : 0
                    }
                    var newParentArray = (new Array(thisDir)).concat(parentArray);
                    tree.addFullScan(entry.fullPath, thisDir, newParentArray);
                } else if (entry.isFile) {
                    FileUtil.getFile(function(file) {
//console.log(JSON.stringify(file));
                        parent.files[entry.name] = {
                            name : file.name,
                            fullPath : file.fullPath,
                            size : file.size,
                            lastModifiedDate : file.lastModifiedDate,
                            type : file.type
                        }

                        for (var i in parentArray) {
                            // すべての親のディレクトリにファイルサイズをプラスしてディレクトリ使用量を計算
                            parentArray[i].size += file.size;
                        }

                    }, entry.fullPath, entry.name);
                }
            });

        });
    }
}


/*
{"name":"w_KO_20130615.pdf","fullPath":"file:///mnt/sdcard/jw_media/media_magazines/KO/2013_06/pdf/w_KO_20130615.pdf","type":"application/pdf","lastModifiedDate":1369842946000,"size":65079,"start":0,"end":65079}

 [{"isFile":false,"isDirectory":true,"name":"media_magazines","fullPath":"file:///mnt/sdcard/jw_media/media_magazines","filesystem":null},
 {"isFile":false,"isDirectory":true,"name":"testaaaaa","fullPath":"file:///mnt/sdcard/jw_media/testaaaaa","filesystem":null}]
*/