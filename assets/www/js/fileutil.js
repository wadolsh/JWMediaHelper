var FileUtil = {
    fileExtend : "pdf,epub,mp3,m4b",
    fileSystem : null,
    baseDirName : "jw_media",
    baseDir : "file:///mnt/sdcard/jw_media/",


    init : function() {
        var util = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                            function(fileSystem){
                                util.fileSystem = fileSystem;
                                //util.rootDirEntry = fileSystem.root;
                                //console.log("root : " + JSON.stringify(util.fileSystem));
                                //console.log("util.baseDir : " + JSON.stringify(util.baseDir));

                            }, this.onError);
/*
        window.resolveLocalFileSystemURI(util.baseDir,
                            function(fileEntry){
                                //console.log("fileEntry : " + JSON.stringify(fileEntry));
                                util.baseDir = fileEntry.getDirectory(util.baseDirName, {create: true});

                            }, this.onError);
*/
    },

    onError : function(evt){
        console.log(evt.target.error.code);
    },

    download : function(uri, filePath, successCallback) {
        var util = this;
        var fileTransfer = new FileTransfer();
        var eURI = encodeURI(uri);

        // 다운로드 성공시의 콜백이 없는경우 기본 콜백을 설정
        // ダウンロード成功時のCallBack設定がない場合のDefault設定
        successCallback = successCallback
                                || function(entry) {
                                        console.log("download complete: " + entry.fullPath);
                                   };

        var $download_progress = $('#download_progress');

        fileTransfer.onprogress = function(progressEvent) {
            console.log(JSON.stringify(progressEvent));
            if (progressEvent.lengthComputable) {
                var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                $download_progress.html(perc + "% loaded...");
            } else {
                if(statusDom.innerHTML == "") {
                    $download_progress.html("Loading");
                } else {
                    $download_progress.html(statusDom.innerHTML += ".");
                }
            }
        };


        fileTransfer.download(
            eURI,
            util.baseDir + filePath,
            successCallback,
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );
    },

    getExtension : function(fileName, splitChar) {
        splitChar = splitChar | '.';
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
            return dir + "/" + fileName;
        }
    },

    convertToDirFromLink : function(linkStr) {
        var fileName = this.getExtension(linkStr, '/');
        var category = linkStr.match(/media_[a-z]+[/]/g);

        console.log(" category + fileName" + category + fileName);
        return category + fileName;
    }
}