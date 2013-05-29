var FileUtil = {
    fileExtend : "pdf,epub,mp3,m4b",
    fileSystem : null,
    rootDirEntry : null,
    baseMediaDirName : "jw_media",
    baseMediaDir : "file:///mnt/sdcard/jw_media/",

    init : function() {
        var util = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                            function(fileSystem){
                                util.fileSystem = fileSystem;
                                util.rootDirEntry = fileSystem.root;
                                console.log("root1 : " + JSON.stringify(util.fileSystem));
                                console.log("root2 : " + JSON.stringify(util.rootDirEntry));
                                //console.log("util.baseMediaDir : " + JSON.stringify(util.baseMediaDir));

                            }, this.onError);
/*
        window.resolveLocalFileSystemURI(util.baseMediaDir,
                            function(fileEntry){
                                //console.log("fileEntry : " + JSON.stringify(fileEntry));
                                util.baseMediaDir = fileEntry.getDirectory(util.baseMediaDirName, {create: true});

                            }, this.onError);
*/
    },

    onError : function(evt){
        console.log(evt.target.error.code);
    },

    download : function(uri, filePath, $progressArea, successCallback) {
        var util = this;
        var fileTransfer = new FileTransfer();
        var eURI = encodeURI(uri);

        // 다운로드 성공시의 콜백이 없는경우 기본 콜백을 설정
        // ダウンロード成功時のCallBack設定がない場合のDefault設定
        successCallback = successCallback
                                || function(entry) {
                                        console.log("download complete: " + entry.fullPath);
                                   };

        if ($progressArea) {
            $progressArea.trigger('downloadStart');
            fileTransfer.onprogress = function(progressEvent) {
//console.log(JSON.stringify(progressEvent));
                // TODO
                $progressArea.trigger('downloading', [progressEvent]);
            };
        }


        fileTransfer.download(
            eURI,
            util.baseMediaDir + filePath,
            successCallback,
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );
        return fileTransfer;
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
        console.log("dowonload to= " +  category + this.convertToDirFromFileName(fileName));
        return category + this.convertToDirFromFileName(fileName);
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

    downloadStart : function(event) {

        this.$progressBar = $('<div class="progress-bar" style="width: 0%"/>').appendTo($(this)).wrap('<div class="progress progress-striped active"/>');
    },

    downloading : function(event, progressEvent) {
        if (progressEvent.lengthComputable) {
            var percentage = Math.ceil(progressEvent.loaded / (progressEvent.total * 2) * 100);

//console.log(percentage + '|' +  progressEvent.loaded + '|' + progressEvent.total);

            this.$progressBar.css('width', percentage + '%').text(Math.ceil(progressEvent.loaded / 1024) + 'KB / ' + Math.ceil(progressEvent.total / 1024) + 'KB');;

            if (percentage > 99) {
                this.$progressBar.parent().remove();
                $(this).addClass('btn-success');
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