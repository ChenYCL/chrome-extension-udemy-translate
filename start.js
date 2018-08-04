
try {
    // alert('preparing...')
    // $('.captions-display--vjs-ud-captions-cue-text--38tMf').addClass('cover');
    cssAppend();
    if (document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0]) {
        var oldSub = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].outerText;
    }

    setInterval(function () {

        let subtitle = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf');
        if (subtitle[0]) {
            if (subtitle[0].outerText !== oldSub) {
                console.log(subtitle[0].outerText)
                oldSub = subtitle[0].outerText;
                /* requeset */
                var appKey = '30ab5b76f94031b6';
                var key = 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5';// 注意：暴露appSecret，有被盗用造成损失的风险
                var salt = (new Date).getTime();
                var query = subtitle[0].outerText;
                // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
                var from = 'en';
                var to = 'zh-CHS';
                var str1 = appKey + query + salt + key;
                var sign = md5(str1);
                $.ajax({
                    url: 'https://openapi.youdao.com/api',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        q: query,
                        appKey: appKey,
                        salt: salt,
                        from: from,
                        to: to,
                        sign: sign
                    },
                    success: function (data) {
                        console.log(data);
                        let wrapper = $('.vjs-ud-captions-display div').eq(1);
                        if (!wrapper.has('h2').length) {
                            wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;background:#4F5155"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${data.translation[0]}</h2></div>`)
                        } else {
                            wrapper.find('h2').text(data.translation[0])
                        }
                    }
                });
            }
        }

    }, 100)
} catch (e) {

}



function cssAppend() {
    var css = '.captions-display--vjs-ud-captions-cue-text--38tMf { display: none !important; }  .zh_sub{ display: block !important }',
        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
}


function chooseApi() {
    let info = localStorage.getItem('udemy-tranlate');
    if (info.type == 'youdao') {
        youdao_Send();
    } else if (info.type == 'baidu') {
        baidu_Send();
    }
    function youdao_Send() {
        // youdao translate request 
    }
    function baidu_Send() {
        // baidu translate request 

    }
}