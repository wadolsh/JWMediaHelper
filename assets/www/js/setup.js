// ajax처리는 동기화해서 처리
// すべてのajaxロードを同期して処理
$.ajaxSetup({
    type  : 'GET',
    async : false,
    error : function(jqXHR, textStatus, errorThrown) {
        console.log(JSON.stringify(this));
        alert(textStatus + ' = ' + this.url);

    }
});

var setting = null;
var Setup = {
    lang : null,
    langData : null,

    init : function() {
        var util = this;

        // 설정화면의 환경설정을 취득(Globel로 선언)
        // 環境設定を取得
        setting = new LocalStorageJsonData('setting');

        // 화면처리 언어를 선택
        // 画面表示言語を選択
        if (!setting.lang) {
            // TODO 동기화 또는 처리 순번 확인인 필요
            navigator.globalization.getLocaleName(
                function (locale) { util.lang = locale.value;},
                function () {util.lang = "en";}
            );
        } else {
            this.lang = setting.lang;
        }

        return this;
    },

    convert : function(fileNameKey) {
        var util = this;
        //console.debug(util.lang);

        $.getJSON('data/lang/' + util.lang + '.json', function(data) {
            util.langData = data[fileNameKey];
            $.each(util.langData, function(key, val) {
                $('#' + key).html(val);
            });
        });
    }
}


var LocalStorageJsonData = function(keyName) {
    this.keyName = keyName;
    this.load();
};
LocalStorageJsonData.prototype = {
    keyName : null,
    data : null,

    load : function() {
        this.data = JSON.parse(window.localStorage.getItem(this.keyName));
        if (!this.data) {
            this.data = {};
        }
    },

    save : function() {
        window.localStorage.setItem(this.keyName, JSON.stringify(this.data));
        this.load();
console.log(JSON.stringify(this.data));
    },

    remove : function() {
        window.localStorage.removeItem(this.keyName);
        this.load();
console.log(JSON.stringify(this.data));
    }
}