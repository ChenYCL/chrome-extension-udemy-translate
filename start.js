
try {

    cssAppend();
    if (document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0]) {
        var oldSub = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf')[0].outerText;
    }

    let configInfo = null;
    chrome.storage.sync.get('udemy', function (data) {
        console.log(JSON.parse(data.udemy).apiKey);
        configInfo = JSON.parse(data.udemy);
    })
    let firstInit = 1;

    setInterval(function () {
        let subtitle = document.getElementsByClassName('captions-display--vjs-ud-captions-cue-text--38tMf');
        if (subtitle[0]) {
            if (subtitle[0].outerText !== oldSub) {
                console.log(subtitle[0].outerText)
                oldSub = subtitle[0].outerText;
                if (firstInit == 1 && configInfo == null) {
                    alert('当前未配置,使用默认有道云api,可能流量到期,请尽早配置')
                    firstInit++;
                }
                // send request
                let _apiKey = configInfo == null ? '30ab5b76f94031b6' : configInfo.apiKey == '' ? '30ab5b76f94031b6' : configInfo.apiKey;
                let _Key = configInfo == null ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key == '' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key;
                chooseApiSend(configInfo, _apiKey, _Key, subtitle[0].outerText, md5);
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


function chooseApiSend(configInfo, apiKey, key, subtitle, md5) {
    if (configInfo.apiType == 'youdao') {
        youdaoSend(configInfo, apiKey, key, subtitle, md5);
    } else if (configInfo.apiType == 'baidu') {
        baiduSend(configInfo, apiKey, key, subtitle, md5);
    }
}


function youdaoSend(configInfo, apiKey, key, subtitle, md5) {  // youdao translate request 
    var apiKey = apiKey;
    var key = key;
    var salt = (new Date).getTime();
    var query = subtitle;
    var from = '';
    var to = configInfo.aimLang == 'undefined' ? 'zh-CHS' : configInfo.aimLang;
    var str1 = apiKey + query + salt + key;
    var sign = md5(str1);
    // console.log(apiKey, key);

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
            if (typeof data.translation == "undefined") {
                chrome.storage.sync.set({ currentState: 'off' }, function () {
                    console.log('error,reset state')
                });

                return
            }
            let subtitle = typeof data.translation == "undefined" ?'当前配置错误,或目标语言相同':data.translation[0]
            let wrapper = $('.vjs-ud-captions-display div').eq(1);
            if (!wrapper.has('h2').length) {
                wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;background:#4F5155"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${subtitle}</h2></div>`)
            } else {
                wrapper.find('h2').text(subtitle)
            }
        },
        error: function () {
            alert('用户配置有误，或当前接口流量已达上限');
        }
    });
}

function baiduSend(configInfo, apiKey, key, subtitle) {
    // baidu translate request 

    var apiKey = apiKey;
    var key = key;
    var salt = (new Date).getTime();
    var query = subtitle;
    var from = 'auto';
    var to = configInfo.aimLang == 'undefined' ? 'zh' : configInfo.aimLang;
    var str1 = apiKey + query + salt + key;
    var sign = md5(str1);
    // console.log(apiKey, key);

    $.ajax({
        url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'post',
        dataType: 'json',
        data: {
            q: query,
            appid: apiKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        },
        success: function (data) {
            if (typeof data.trans_result == "undefined") {
                chrome.storage.sync.set({ currentState: 'off' }, function () {
                    console.log('error,reset state')
                });
                return
            }
            let subtitle = typeof data.trans_result == "undefined" ?'当前配置错误,或目标语言相同':data.trans_result[0].dst
            let wrapper = $('.vjs-ud-captions-display div').eq(1);
            if (!wrapper.has('h2').length) {
                wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;background:#4F5155"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${subtitle}</h2></div>`)
            } else {
                wrapper.find('h2').text(subtitle)
            }
        },
        error: function () {
            alert('用户配置有误，或当前接口流量已达上限');
        }
    });

}