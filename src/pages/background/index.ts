// if (process.env.NODE_ENV === 'development') {
//     const eventSource = new EventSource(
//         `http://${process.env.REACT_APP__HOST__}:${process.env.REACT_APP__PORT__}/reload/`
//     );
//     console.log('--- 开始监听更新消息 ---');
//     eventSource.addEventListener('content_changed_reload', async ({ data }) => {
//         const [tab] = await chrome.tabs.query({
//             active: true,
//             lastFocusedWindow: true,
//         });
//         const tabId = tab.id || 0;
//         console.log(`tabId is ${tabId}`);
//         await chrome.tabs.sendMessage(tabId, {
//             type: 'window.location.reload',
//         });
//         console.log('chrome extension will reload', data);
//         chrome.runtime.reload();
//     });
// }
import {
    baiduRequest,
    youdaoRequset,
    yandexRequest,
    a_translatorRequest,
    deepLRequest,
    caiyunRequest,
    msRequest,
} from '../../utils/request';




console.log('This is the background page.');
console.log('Put the background scripts here.');
console.log('init done');

const getItem = (key: string) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(key, (value) => {
            resolve(value[key])
        })
    })
}


// init storage
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == 'install') {
        console.log('This is a first install!');
        chrome.storage.local.set({
            status: false,
            backgroundColor: '#000000',
            backgroundOpacity: 1,
            originColor: '#ffffff',
            originFont: 22,
            originWeight: 700,
            transFont: 28,
            transColor: '#ffffff',
            transWeight: 700,
            language: 'zh-cn',
            origin_lang: 'auto',
            trans_way: 'youdao',
            youdao_id: '',
            youdao_key: '',
            baidu_id: '',
            baidu_key: '',
            yandex_key: '',
            a_translater_key: '',
            deepl_key: '',
            caiyun_key: '',
            microsoftTranslate_key: '',
            // 翻译的文本信息 暂时存储
            txt: {},
        });
    } else if (details.reason == 'update') {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log(
            'Updated from ' + details.previousVersion + ' to ' + thisVersion + '!'
        );
    }
});

const REQUEST = async (originText: any, callback: (param: any) => void) => {
    let trans_way = await getItem('trans_way');
    let res = undefined;
    return new Promise<{ origin: string, translate: string } | undefined>((async (resolve, reject) => {

        switch (trans_way) {
            case 'youdao':
                console.log(`youdao`)
                res = await youdaoRequset(originText);
                callback(res)
                break;
            // case 'google':
            //     let res = await googleTranslate(originText);
            //     return {
            //         origin: originText,
            //         translate: res.data[0],
            //     };
            case 'baidu':
                res = await baiduRequest(originText);
                callback(res)
                break;
            case 'yandex':
                res = await yandexRequest(originText);
                callback(res)
                break
            case 'a_translator':
                res = await a_translatorRequest(originText);
                callback(res)
                break
            case 'caiyun':
                res = await caiyunRequest(originText);
                callback(res)
                break
            case 'microsofttranslate':
                res = await msRequest(originText);
                callback(res)
                break
            default:
                // deepl
                res = await deepLRequest(originText);
                callback(res)
        }
    }))


};



chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        console.log(`sender`, sender)
        let { text } = request;
        setTimeout(async function () {
            await REQUEST(text, function (result: { translate: any; }) {
                console.log(`background recevied message`, request, text)
                // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                //     // @ts-ignore
                //     chrome.tabs.sendMessage(tabs[0].id, { ...result, origin: text }, function (response) {
                //         console.log(`complete`,response)
                //         if (response.complete) {
                //             return true
                //         }
                //     });
                // });
                chrome.tabs.sendMessage(sender.tab!.id! as any,{ ...result, origin: text })
            });
        }, 1);
    }
);



