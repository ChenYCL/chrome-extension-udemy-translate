
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

        let select = $('#'+configInfoBefore.apiType).data('select');
        select.val(configInfoBefore.aimLang)
        // switch (configInfoBefore.apiType) {
        //     case 'baidu':
        //         // $('li.baidu').find('input[name=baidu][value=' + configInfoBefore.aimLang + ']').attr('checked', 'checked');
        //         // $('#baidu').find('option[value='+configInfoBefore.aimLang+']')
        //         let select = $('#baidu').data('select');
        //         select.val(configInfoBefore.aimLang)
        //         break;
        //     case 'yandex':
        //         // $('li.yandex').find('input[name=yandex][value=' + configInfoBefore.aimLang + ']').attr('checked', 'checked');
        //         $('#yandex').find('option[value='+configInfoBefore.aimLang+']')
        //         break;
        //     default:
        //         // $('li.youdao').find('input[name=youdao][value=' + configInfoBefore.aimLang + ']').attr('checked', 'checked');
        //         $('#youdao').find('option[value='+configInfoBefore.aimLang+']')
        // }
    })

}

function config() {

    let config = {
        'apiType': $('input[name=apiType]:checked').val(),
        'apiKey': $('input[name=apiValue]').val(),
        // 'aimLang': $('select[id=' + $('input[name=apiType]:checked').val() + ']:checked').val(),
        'aimLang': $('select[id='+$('input[name=apiType]:checked').val()+']').val(),
        'Key': $('input[name=key]').val(),
    }
    chrome.storage.sync.set({ udemy: JSON.stringify(config) }, function () {
        console.log('saved success')
    })
    console.log(config);

    return config;
}

// remove input id&apiID
$('input[name=apiType]').on('click',function(){
    let apiType = null;
    let _this = this;
    chrome.storage.sync.get('udemy', function (data) {
        let configInfoBefore = JSON.parse(data.udemy);
        apiType = configInfoBefore.apiType;
        if(apiType !== $(_this).val()) {
            $('input[name=apiValue]').val('')
            $('input[name=key]').val('')
        }
    })
 
})
