
'use strict';

window.onload = function () {
    let configInfoBefore = null;
    restore(configInfoBefore);
  
    $('.apply').on('click', function (e) {
        e.stopPropagation();
        config();
        window.close();
    })
    $('.cancel').on('click', function (e) {
        e.stopPropagation();
        window.close();
    })
}

function restore(configInfoBefore) {

    chrome.storage.sync.get('udemy', function (data) {
        configInfoBefore = JSON.parse(data.udemy);
        $('input[name=apiValue]').val(configInfoBefore.apiKey)
        $('input[name=key]').val(configInfoBefore.Key)
        $('input[name=apiType][value=' + configInfoBefore.apiType + ']').attr('checked', 'checked')

        switch (configInfoBefore.apiType) {
            case 'baidu':
                $('li.baidu').find('input[name=baidu][value=' + configInfoBefore.aimLang + ']').attr('checked', 'checked');
                break;
            default:
                $('li.youdao').find('input[name=youdao][value=' + configInfoBefore.aimLang + ']').attr('checked', 'checked');
        }
    })

}

function config() {

    let config = {
        'apiType': $('input[name=apiType]:checked').val(),
        'apiKey': $('input[name=apiValue]').val(),
        'aimLang': $('input[name=' + $('input[name=apiType]:checked').val() + ']:checked').val(),
        'Key': $('input[name=key]').val(),
    }
    chrome.storage.sync.set({ udemy: JSON.stringify(config) }, function () {
        console.log('saved success')
    })
    console.log(config);

    return config;
}


