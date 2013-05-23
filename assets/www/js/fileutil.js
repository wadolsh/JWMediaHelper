var FileUtil = {
    fileSystem : null,
    rootDirEntry : null,

    init : function() {
        var util = this;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                            function(fileSystem){ // success get file system
                                alert('sdfsdf');
                                util.fileSystem = fileSystem;
                                util.rootDirEntry = fileSystem.root;
                                console.log("root : " + util.rootDirEntry);
                                alert(util.rootDirEntry);
                            }, function(evt){ // error get file system
                                console.log(evt.target.error.code);
                            }
                        );
    },


    download : function(uri, filePath) {
        var fileTransfer = new FileTransfer();
        var encodeURI = encodeURI(uri);

        fileTransfer.download(
            encodeURI,
            filePath,
            function(entry) {
                console.log("download complete: " + entry.fullPath);
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("upload error code" + error.code);
            }
        );
    }
}