
try {
    // alert('preparing...')
    // $('.captions-display--vjs-ud-captions-cue-text--38tMf').addClass('cover');
    cssAppend();
    if (document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0]) {
        var oldSub = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].outerText;
    }

    let configInfo = null;
    chrome.storage.sync.get('udemy', function (data) {
        console.log(JSON.parse(data.udemy).apiKey);
        configInfo = JSON.parse(data.udemy);
    })
  
    setInterval(function () {
        let subtitle = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf');
        if (subtitle[0]) {
            if (subtitle[0].outerText !== oldSub) {
                console.log(subtitle[0].outerText)
                oldSub = subtitle[0].outerText;
                // send request
                let _apiKey = configInfo.apiKey;
                let _Key = configInfo.Key;
                let apiKey = _apiKey == 'undefined' ? '30ab5b76f94031b6' : _apiKey;
                let Key = _Key == 'undefined' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : _Key;
                chooseApiSend(configInfo, apiKey, Key, subtitle[0].outerText,md5);
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


function chooseApiSend(configInfo, apiKey, key, subtitle,md5) {
    if (configInfo.apiType == 'youdao') {
        youdao_Send(apiKey, key, subtitle,md5);
    } else if (configInfo.apiType == 'baidu') {
        baidu_Send(apiKey, key, subtitle,md5);
    }
    function youdao_Send(apiKey, key, subtitle,md5) {
        // youdao translate request 
        /* requeset */
        var apiKey = apiKey;
        var key = key;
        var salt = (new Date).getTime();
        var query = subtitle;
        var from = '';
        var to = configInfo.aimLang == 'undefined' ? 'zh-CHS' : configInfo.aimLang;
        var str1 = apiKey + query + salt + key;
        var sign = md5(str1);
        console.log(apiKey, key);
        $.ajax({
            url: 'https://openapi.youdao.com/api',
            type: 'post',
            dataType: 'json',
            data: {
                q: query,
                appKey: apiKey,
                salt: salt,
                from: from,
                to: to,
                sign: sign
            },
            success: function (data) {
                let wrapper = $('.vjs-ud-captions-display div').eq(1);
                if (!wrapper.has('h2').length) {
                    wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;background:#4F5155"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${data.translation[0]}</h2></div>`)
                } else {
                    wrapper.find('h2').text(data.translation[0])
                }
            },
            error: function () {
                alert('用户配置有误，或当前接口流量已达上限');
            }
        });
    }
    function baidu_Send(apiKey, key, subtitle) {
        // baidu translate request 

    }
}