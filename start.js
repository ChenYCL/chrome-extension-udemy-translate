try {

    cssAppend();
    let typeUrl = window.location.href;
    if (typeUrl.includes('udemy')) {
        if ($('[data-purpose=captions-cue-text]').length > 0) {
            var oldSub = $('[data-purpose=captions-cue-text]').html();
        }
    } else if (typeUrl.includes('netflix')) {
        if ($('.player-timedtext-text-container').length) {
            var oldSub = '';
            let container = $('.player-timedtext-text-container').find('span');
            for (let i = 0, len = container.length; i < len; i++) {
                oldSub += container.eq(i).html().replace('<br>', ' ').replace('-', '').replace(/\[(.+)\]/, '');
            }
        }
    } else if (typeUrl.includes('lynda')) {
        if ($('.mejs-captions-position mejs-captions-position-hover').length) {
            var oldSub = '';
            let container = $('.mejs-captions-position mejs-captions-position-hover').find('span').eq(0);
            for (let i = 0, len = container.length; i < len; i++) {
                oldSub += container.eq(i).html().replace('<br>', ' ').replace('-', '').replace(/\[(.+)\]/, '');
            }
        }
    } else if (typeUrl.includes('hbo')) {
        if(!$('video').parent().parent().next().hasClass('zh_sub')){
            $('video').parent().parent().next().addClass('hbo-now')
        }else{
            $('.zh_sub').next().addClass('hbo-now') 
        }
    
        if($('video').parent().parent().next().hasClass('zh_sub')){
            container = $('.zh_sub').next().find('span');
           
        }else{
            container = $('video').parent().parent().next().find('span');
            
        }
        for (let i = 0; i < container.length; i++) {
            if (container.eq(i)[0].innerText&&!container.eq(i)[0].innerText.includes('/')) {
                oldSub += ' ' + container.eq(i)[0].innerText
            }
        }
        oldSub = oldSub.replace(/[\r\n]/g, "").trim();
        oldSub = oldSub.replace(/undefined/g, '')
        if (oldSub.indexOf('Series Movies Kids') == 0) {
            oldSub = ''
        } else {
            if (oldSub.includes('Series Movies Kids')) {
                oldSub = oldSub.substr(0, oldSub.lastIndexOf('Series Movies Kids'))
            }
            if(oldSub.includes('.')&&oldSub.substr(oldSub.lastIndexOf('.'),100000).includes('/')&&(oldSub.length-1)!=oldSub.lastIndexOf('.')){
                oldSub = oldSub.substr(0,oldSub.lastIndexOf('.')+1)
            }
        }
    }else if(typeUrl.includes('hulu')){
        var oldSub = '';
        let subHtml = $('.caption-text-box > p').html();
        if(subHtml.split('<br>').length>1){
            oldSub = subHtml.split('<br>')[0]+' '+subHtml.split('<br>')[1]
        }else{
            oldSub = subHtml;
        }
        oldSub = oldSub.replace(/[\r\n]/g, "").trim();
    }


    let configInfo = null;
    chrome.storage.sync.get('udemy', function (data) {
        console.log(JSON.parse(data.udemy).apiKey);
        configInfo = JSON.parse(data.udemy);
    })
    var firstInit = 1;

    setInterval(function () {
        if (typeUrl.includes('udemy')) { // udemy subtitle
            let subtitle = $('[data-purpose=captions-cue-text]');
            if (subtitle[0] && (subtitle[0].outerText !== oldSub)) {
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
        // netflix  
        if (typeUrl.includes('netflix')) {
            let el = $('.VideoContainer').find('span');
            let netflixSub = '';
            for (let i = 0, len = el.length; i < len; i++) {
                netflixSub += el.eq(i).html().replace('<br>', ' ').replace(/\[(.+)\]/, '').replace('-', '');
            }
            if (el.length && (netflixSub !== oldSub)) {
                console.log(netflixSub)
                oldSub = netflixSub;
                if (firstInit == 1 && configInfo == null) {
                    alert('当前未配置,使用默认有道云api,可能流量到期,请尽早配置')
                    firstInit++;
                }
                // send request
                let _apiKey = configInfo == null ? '30ab5b76f94031b6' : configInfo.apiKey == '' ? '30ab5b76f94031b6' : configInfo.apiKey;
                let _Key = configInfo == null ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key == '' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key;
                chooseApiSend(configInfo, _apiKey, _Key, netflixSub, md5);
            }
        }
        // lynda
        if (typeUrl.includes('lynda')) {
            let el = $('.mejs-captions-position').find('span').eq(0);
            let lyndaSub = '';
            for (let i = 0, len = el.length; i < len; i++) {
                lyndaSub += el.eq(i).html().replace('<br>', ' ').replace(/\[(.+)\]/, '').replace('-', '');
            }
            if (el.length && (lyndaSub !== oldSub)) {
                console.log(lyndaSub)
                oldSub = lyndaSub;
                if (firstInit == 1 && configInfo == null) {
                    alert('当前未配置,使用默认有道云api,可能流量到期,请尽早配置')
                    firstInit++;
                }
                // send request
                let _apiKey = configInfo == null ? '30ab5b76f94031b6' : configInfo.apiKey == '' ? '30ab5b76f94031b6' : configInfo.apiKey;
                let _Key = configInfo == null ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key == '' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key;
                chooseApiSend(configInfo, _apiKey, _Key, lyndaSub, md5);
            }

        }
        // hbo
        if (typeUrl.includes('hbo')) {
            let hboSub,container;
     
            if($('video').parent().parent().next().hasClass('zh_sub')){
                container = $('.zh_sub').next().find('span');
               
            }else{
                container = $('video').parent().parent().next().find('span');
                
            }
            for (let i = 0; i < container.length; i++) {
                if (container.eq(i)[0].innerText&&!container.eq(i)[0].innerText.includes('/')) {
                    hboSub += ' ' + container.eq(i)[0].innerText
                }
            }
            hboSub = hboSub.replace(/[\r\n]/g, "").trim();
            hboSub = hboSub.replace(/undefined/g, '')
            if (hboSub.indexOf('Series Movies Kids') == 0) {
                hboSub = ''
            } else {
                if (hboSub.includes('Series Movies Kids')) {
                    hboSub = hboSub.substr(0, hboSub.lastIndexOf('Series Movies Kids'))
                }
                if(hboSub.includes('.')&&hboSub.substr(hboSub.lastIndexOf('.'),100000).includes('/')&&(hboSub.length-1)!=hboSub.lastIndexOf('.')){
                    hboSub = hboSub.substr(0,hboSub.lastIndexOf('.')+1)
                }
            }

            if (hboSub !== oldSub && hboSub.trim() != '') {
                console.log(hboSub)
                oldSub = hboSub;
                // if (firstInit == 1 && configInfo == null) {
                //     firstInit++;
                //     alert('当前未配置,使用默认有道云api,可能流量到期,请尽早配置')
                // }
                // send request
                let _apiKey = configInfo == null ? '30ab5b76f94031b6' : configInfo.apiKey == '' ? '30ab5b76f94031b6' : configInfo.apiKey;
                let _Key = configInfo == null ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key == '' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key;
                chooseApiSend(configInfo, _apiKey, _Key, hboSub, md5);
            }

        }
        // hulu
        if(typeUrl.includes('hulu')){
            if (window.location.href.includes('hbo')) {
                let broSubDom = $('video').parent().parent();
                broSubDom.next().css({
                    "display": "none"
                })
            }
            let huluSub;
            let subHtml = $('.caption-text-box > p').html();
            if(subHtml.split('<br>').length>1){
                huluSub = subHtml.split('<br>')[0]+' '+subHtml.split('<br>')[1]
            }else{
                huluSub = subHtml;
            }
            huluSub = huluSub.replace(/[\r\n]/g, "").trim();
            if (huluSub !== oldSub && huluSub.trim() != '') {
                console.log(huluSub)
                oldSub = huluSub;
                // if (firstInit == 1 && configInfo == null) {
                //     firstInit++;
                //     alert('当前未配置,使用默认有道云api,可能流量到期,请尽早配置')
                // }
                // send request
                let _apiKey = configInfo == null ? '30ab5b76f94031b6' : configInfo.apiKey == '' ? '30ab5b76f94031b6' : configInfo.apiKey;
                let _Key = configInfo == null ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key == '' ? 'PT2CD9BQMwINFv8LdqdQkes4dqHvVLa5' : configInfo.Key;
                chooseApiSend(configInfo, _apiKey, _Key, huluSub, md5);
            }
        }

    }, 50)
} catch (e) {

}


function cssAppend() {
    let css = 'div[class^="captions-display--vjs-ud-captions-cue-text"] { display: none !important; }  .zh_sub{ display: block !important } .player-timedtext-text-container{display:none !important} .mejs-captions-text{display:none !important} .caption-text-box{display:none !important} .hbo-now{display:none !important}',
        head = document.getElementsByTagName('head')[0],
        style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.appendChild(style);
    if (window.location.href.includes('hbo')) {
        let broSubDom = $('video').parent().parent();
        broSubDom.next().css({
            "display": "none"
        })
    }
  
}


function chooseApiSend(configInfo, apiKey, key, subtitle, md5) {
    if (configInfo.apiType == 'youdao') {
        youdaoSend(configInfo, apiKey, key, subtitle, md5);
    } else if (configInfo.apiType == 'baidu') {
        baiduSend(configInfo, apiKey, key, subtitle, md5);
    } else if (configInfo.apiType == 'yandex') {
        yandexSend(configInfo, apiKey, subtitle);
    }
}


function youdaoSend(configInfo, apiKey, key, subtitle, md5) { // youdao translate request 
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
                chrome.storage.sync.set({
                    currentState: 'off'
                }, function () {
                    console.log('error,reset state')
                });
                return
            }
            let subtitle = typeof data.translation == "undefined" ? '当前配置错误,或目标语言相同' : data.translation[0]
            // judge typeUrl
            let typeUrl = window.location.href;
            if (typeUrl.includes('udemy')) {
                var wrapper = $('.vjs-ud-captions-display div').eq(1);
                if (!wrapper.has('h2').length) {
                    wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    wrapper.find('h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`)
                }
            }
            if (typeUrl.includes('netflix')) {
                var wrapper = $('.player-timedtext')
                chrome.storage.sync.set({
                    netflixSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if (wrapper.siblings(".zh_sub").length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><i style="font-size:18px;font-style:normal">${query}</i></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }

            if (typeUrl.includes('lynda')) {
                var wrapper = $('.mejs-captions-position')
                chrome.storage.sync.set({
                    lyndaSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if ($('.mejs-captions-position').find('h2').length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }
            if (typeUrl.includes('hbo')) {
                let wrapperBroSub = $('video').parent().parent();
                chrome.storage.sync.set({
                    hboSubCache: wrapperBroSub.next().html()
                }, function () {
                    console.log('saved')
                });

                if (wrapperBroSub.next().find('h2').length < 1) {
                    wrapperBroSub.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }


            }
            if (typeUrl.includes('hulu')) {
                var wrapper = $('.caption-text-box')
                chrome.storage.sync.set({
                    hboSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });

                if (wrapper.next().find('h2').length < 1) {
                    wrapper.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);color:white;font-size:1.8rem;text-align:center;font-weight:bold">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }

            }

        },
        error: function () {
            console.error('用户配置有误，或当前接口流量已达上限');
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
                if (data.error_code == 54004) {
                    alert('账户流量额度不足')
                    chrome.storage.sync.set({
                        currentState: 'off'
                    }, function () {
                        console.log('error,reset state')
                    });
                    return
                }
            }
            let subtitle = typeof data.trans_result == "undefined" ? '当前配置错误,或目标语言相同' : data.trans_result[0].dst
            // judge typeUrl
            let typeUrl = window.location.href;
            if (typeUrl.includes('udemy')) {
                var wrapper = $('.vjs-ud-captions-display div').eq(1);
                if (!wrapper.has('h2').length) {
                    wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    wrapper.find('h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`)
                }
            }
            if (typeUrl.includes('netflix')) {
                var wrapper = $('.player-timedtext')
                chrome.storage.sync.set({
                    netflixSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if (wrapper.siblings(".zh_sub").length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><i style="font-size:18px;font-style:normal">${query}</i></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }
            if (typeUrl.includes('lynda')) {
                var wrapper = $('.mejs-captions-position')
                chrome.storage.sync.set({
                    lyndaSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if ($('.mejs-captions-position').find('h2').length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }
            if (typeUrl.includes('hbo')) {
                let wrapperBroSub = $('video').parent().parent();
                chrome.storage.sync.set({
                    hboSubCache: wrapperBroSub.next().html()
                }, function () {
                    console.log('saved')
                });

                if (wrapperBroSub.next().find('h2').length < 1) {
                    wrapperBroSub.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }


            }
            if (typeUrl.includes('hulu')) {
                var wrapper = $('.caption-text-box')
                chrome.storage.sync.set({
                    hboSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });

                if (wrapper.next().find('h2').length < 1) {
                    wrapper.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);color:white;font-size:1.8rem;text-align:center;font-weight:bold">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }

            }
        },
        error: function () {
            console.error('用户配置有误，或当前接口流量已达上限');
        }
    });

}

function yandexSend(configInfo, apiKey, subtitle) {
    var apiKey = apiKey;
    var query = subtitle;
    var to = configInfo.aimLang == 'undefined' ? 'zh' : configInfo.aimLang;
    if (query == '') return
    $.ajax({
        url: 'https://translate.yandex.net/api/v1.5/tr.json/translate',
        type: 'post',
        dataType: 'json',
        data: {
            key: apiKey,
            text: query,
            lang: to
        },
        success: function (data) {
            if (typeof data.text == "undefined") {
                chrome.storage.sync.set({
                    currentState: 'off'
                }, function () {
                    console.log('error,reset state')
                });

                return
            }
            let subtitle = typeof data.text == "undefined" ? '当前配置错误,或目标语言相同' : data.text[0]
            // judge typeUrl
            let typeUrl = window.location.href;
            if (typeUrl.includes('udemy')) {
                var wrapper = $('.vjs-ud-captions-display div').eq(1);
                if (!wrapper.has('h2').length) {
                    wrapper.append(`<div class="zh_sub" style="padding:0 5px 5px 5px;text-align:center;position:relative;top:-12px;"><h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    wrapper.find('h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`)
                }
            }
            if (typeUrl.includes('netflix')) {
                var wrapper = $('.player-timedtext')
                chrome.storage.sync.set({
                    netflixSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if (wrapper.siblings(".zh_sub").length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><i style="font-size:18px;font-style:normal">${query}</i></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }
            if (typeUrl.includes('lynda')) {
                var wrapper = $('.mejs-captions-position')
                chrome.storage.sync.set({
                    lyndaSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });
                if ($('.mejs-captions-position').find('h2').length < 1) {
                    wrapper.append(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }
                console.log(subtitle);
            }
            if (typeUrl.includes('hbo')) {
                let wrapperBroSub = $('video').parent().parent();
                chrome.storage.sync.set({
                    hboSubCache: wrapperBroSub.next().html()
                }, function () {
                    console.log('saved')
                });
                if (wrapperBroSub.next().find('h2').length < 1) {
                    wrapperBroSub.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);color:white;font-size:1.5rem;text-align:center">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }


            }
            if (typeUrl.includes('hulu')) {
                var wrapper = $('.caption-text-box')
                chrome.storage.sync.set({
                    hboSubCache: wrapper.html()
                }, function () {
                    console.log('saved')
                });

                if (wrapper.next().find('h2').length < 1) {
                    wrapper.after(`<div class="zh_sub" 
                    style="padding:0 8px 2px 8px;
                    text-align:center;
                    position:absolute;
                    bottom:10%; 
                    left: 50%;
                    transform: translateX(-50%);
                    ">
                    <h2 style="text-shadow:0.07em 0.07em 0 rgba(0, 0, 0, 0.1);color:white;font-size:1.8rem;text-align:center;font-weight:bold">${subtitle}<br><span style="font-size:18px">${query}</span></h2></div>`)
                } else {
                    $('.zh_sub h2').html(`${subtitle}<br><span style="font-size:18px">${query}</span>`);
                }

            }

        },
        error: function () {
            console.error('用户配置有误，或当前接口流量已达上限');
        }
    });
}