var setting = null;
var Setup = {
    lang : "en",
    langData : null,

    init : function() {
        var util = this;

        // ajax처리는 동기화해서 처리
        // すべてのajaxロードを同期して処理
        $.ajaxSetup({
            type  : 'GET',
            async : false,
            error : function(jqXHR, textStatus, errorThrown) {
                alert(textStatus + ' = ' + errorThrown);
            }
        });

        // 설정화면의 환경설정을 취득
        // 環境設定を取得
        $.getJSON('data/setting.json', {},function(data) {
            //console.debug(JSON.stringify(data));
            setting = data;
        });

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